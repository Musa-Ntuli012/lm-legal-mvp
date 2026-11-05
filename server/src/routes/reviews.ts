import { Router } from 'express';
import { authenticate, requireRoles, requireMembership } from '../middleware/auth';
import { csrfProtection } from '../middleware/csrf';
import { prisma } from '../db';
import { z } from 'zod';
import { sendEmail, submissionConfirmationEmail } from '../services/emailService';

const router = Router();

const reviewSchema = z.object({
  total: z.number().min(0),
  feedback: z.string().optional(),
  scores: z.array(
    z.object({
      criterionId: z.string(),
      score: z.number().min(0),
      comment: z.string().optional(),
    })
  ),
});

const _publishSchema = z.object({
  reviewId: z.string(),
});

// ============================================
// GET /api/reviews
// List unmarked submissions for markers (with blind marking aliases).
// ============================================

/**
 * GET /api/reviews
 * Requires authentication + ACTIVE membership + MARKER or ADMINISTRATOR role.
 *
 * Returns submissions that have not yet been reviewed, ordered by creation
 * date (oldest first). When blindMarking is true, student profiles are
 * aliased (Marker Alias 1, alias1@lmlegal.demo, etc.) to prevent marker bias.
 *
 * Query params:
 * - blindMarking (boolean, default true)
 */
router.get('/', authenticate, requireRoles('MARKER', 'ADMINISTRATOR', 'OWNER'), requireMembership, async (req, res) => {
  const blindMarking = req.query.blindMarking !== 'false';

  const submissions = await prisma.submission.findMany({
    where: {
      review: null,
    },
    include: {
      task: { select: { id: true, title: true } },
      profile: blindMarking
        ? { select: { id: true, displayName: true } }
        : { select: { id: true, email: true, displayName: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  // Alias profiles for blind marking — hide student identity from marker.
  const aliased = blindMarking
    ? submissions.map((s: any, i: number) => ({
        ...s,
        profile: {
          ...s.profile,
          displayName: `Marker Alias ${i + 1}`,
          email: `alias${i + 1}@lmlegal.demo`,
        },
      }))
    : submissions;

  res.json({ submissions: aliased });
});

// ============================================
// GET /api/reviews/drafts
// List draft reviews for the current marker.
// ============================================

/**
 * GET /api/reviews/drafts
 * Requires authentication + ACTIVE membership + MARKER or ADMINISTRATOR role.
 *
 * Returns all DRAFT reviews created by the authenticated marker, with
 * submission and task details included.
 */
router.get('/drafts', authenticate, requireRoles('MARKER', 'ADMINISTRATOR', 'OWNER'), requireMembership, async (req, res) => {
  const drafts = await prisma.review.findMany({
    where: {
      profileId: (req as any).profile!.id,
      status: 'DRAFT',
    },
    include: {
      submission: {
        select: {
          id: true,
          memo: true,
          submittedAt: true,
          task: { select: { id: true, title: true } },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  res.json({ drafts });
});

// ============================================
// PUT /api/reviews/:id
// Update a review (draft only, marker-owned).
// ============================================

/**
 * PUT /api/reviews/:id
 * Requires authentication + ACTIVE membership + MARKER or ADMINISTRATOR role.
 * CSRF-protected.
 *
 * Updates an existing draft review's scores, feedback, and total. Only the
 * marker who created the draft can update it. Status remains DRAFT until
 * published via POST /api/reviews/:id/publish.
 *
 * Path param: :id - Review ID.
 * Body: { total, feedback, scores: [{ criterionId, score, comment }] }
 */
router.put('/:id', authenticate, requireRoles('MARKER', 'ADMINISTRATOR', 'OWNER'), requireMembership, csrfProtection, async (req, res) => {
  const { id } = req.params;
  const markerId = (req as any).profile!.id;
  const parsed = reviewSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_review' });
  }

  // Verify the review exists and belongs to this marker.
  const existing = await prisma.review.findUnique({
    where: { id },
  });

  if (!existing || existing.profileId !== markerId) {
    return res.status(403).json({ error: 'insufficient_role' });
  }

  await prisma.review.update({
    where: { id },
    data: {
      total: parsed.data.total,
      feedback: parsed.data.feedback || '',
      scores: JSON.stringify(parsed.data.scores),
      updatedAt: new Date(),
    },
  });

  res.json({ ok: true });
});

// ============================================
// POST /api/reviews/:id/publish
// Publish a draft review (sets status to PUBLISHED).
// ============================================

/**
 * POST /api/reviews/:id/publish
 * Requires authentication + ACTIVE membership + MARKER or ADMINISTRATOR role.
 * CSRF-protected.
 *
 * Publishes a draft review: sets status to PUBLISHED, sets publishedAt,
 * marks the submission as MARKED, and sends feedback email to the student.
 * Only the marker who created the draft can publish it.
 *
 * Path param: :id - Review ID.
 */
router.post('/:id/publish', authenticate, requireRoles('MARKER', 'ADMINISTRATOR', 'OWNER'), requireMembership, csrfProtection, async (req, res) => {
  const { id } = req.params;
  const markerId = (req as any).profile!.id;

  // Verify the review exists, is a draft, and belongs to this marker.
  const existing = await prisma.review.findUnique({
    where: { id },
    include: {
      submission: {
        include: {
          profile: true,
          task: true,
        },
      },
    },
  });

  if (!existing) {
    return res.status(404).json({ error: 'review_not_found' });
  }

  if (existing.profileId !== markerId) {
    return res.status(403).json({ error: 'insufficient_role' });
  }

  if (existing.status !== 'DRAFT') {
    return res.status(400).json({ error: 'review_not_draft' });
  }

  const submission = existing.submission;
  if (!submission) {
    return res.status(404).json({ error: 'submission_not_found' });
  }

  await prisma.$transaction([
    prisma.review.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    }),
    prisma.submission.update({
      where: { id: submission.id },
      data: {
        status: 'MARKED',
      },
    }),
  ]);

  // Send feedback email to the student (non-blocking).
  try {
    if (submission.profile) {
      sendEmail(submissionConfirmationEmail(
        submission.profile.email,
        submission.profile.displayName || 'Student',
        submission.task.title,
        new Date(),
        submission.late
      )).catch(() => {}); // never block on email failure
    }
  } catch {
    // email failure must not break publish
  }

  res.json({ ok: true });
});

// ============================================
// GET /api/reviews/:id
// Get a specific review (for marker edit view).
// ============================================

/**
 * GET /api/reviews/:id
 * Requires authentication + ACTIVE membership + MARKER or ADMINISTRATOR role.
 *
 * Returns a single review owned by the authenticated marker, with its
 * submission details. Other markers cannot view another marker's review.
 *
 * Path param: :id - Review ID.
 */
router.get('/:id', authenticate, requireRoles('MARKER', 'ADMINISTRATOR', 'OWNER'), requireMembership, async (req, res) => {
  const { id } = req.params;
  const markerId = (req as any).profile!.id;

  const review = await prisma.review.findUnique({
    where: { id },
    include: {
      submission: {
        select: {
          id: true,
          memo: true,
          wordCount: true,
          late: true,
          submittedAt: true,
          task: { select: { id: true, title: true } },
          profile: { select: { id: true, displayName: true } },
        },
      },
    },
  });

  if (!review) {
    return res.status(404).json({ error: 'review_not_found' });
  }

  // Enforce marker ownership — only the marker who created the review can view it.
  if (review.profileId !== markerId) {
    return res.status(403).json({ error: 'insufficient_role' });
  }

  res.json({ review });
});

export default router;
