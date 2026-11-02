import { Router } from 'express';
import { authenticate, requireRoles, requireMembership } from '../middleware/auth';
import { csrfProtection } from '../middleware/csrf';
import { prisma } from '../db';
import { z } from 'zod';
import { sendEmail, feedbackPublishedEmail } from '../services/emailService';

const router = Router();

const reviewScoreSchema = z.object({
  criterionId: z.string(),
  score: z.number().min(0).max(4),
  comment: z.string().optional(),
});

const reviewSchema = z.object({
  submissionId: z.string(),
  scores: z.array(reviewScoreSchema),
  feedback: z.string().optional(),
  total: z.number().min(0).max(20),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
});

// GET /api/reviews/queue - Marker's queue (with blind marking support)
router.get('/queue', authenticate, requireRoles('MARKER', 'ADMINISTRATOR', 'OWNER'), requireMembership, async (req, res) => {
  const blindMarking = req.query.blind === 'true';
  const submissions = await prisma.submission.findMany({
    where: {
      status: 'SUBMITTED',
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

  // Alias profiles for blind marking
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

// GET /api/reviews/drafts - List draft reviews for current marker
router.get('/drafts', authenticate, requireRoles('MARKER', 'ADMINISTRATOR', 'OWNER'), requireMembership, async (req, res) => {
  const drafts = await prisma.review.findMany({
    where: {
      profileId: (req as any).profile!.id,
      status: 'DRAFT',
    },
    include: {
      submission: {
        include: {
          task: { select: { id: true, title: true, practiceArea: true } },
          profile: { select: { id: true, displayName: true } },
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  res.json({ drafts });
});

// POST /api/reviews/draft - Save or update a draft review
router.post('/draft', authenticate, requireRoles('MARKER', 'ADMINISTRATOR', 'OWNER'), requireMembership, csrfProtection, async (req, res) => {
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_review' });
  }

  const { submissionId, scores, feedback, total } = parsed.data;
  const markerId = (req as any).profile!.id;

  // Check if a draft already exists for this submission by this marker
  const existing = await prisma.review.findFirst({
    where: {
      submissionId,
      profileId: markerId,
      status: 'DRAFT',
    },
  });

  const scoresJson = JSON.stringify(scores);
  const now = new Date();

  let review;
  if (existing) {
    review = await prisma.review.update({
      where: { id: existing.id },
      data: {
        scores: scoresJson,
        feedback: feedback || '',
        total,
        updatedAt: now,
      },
    });
  } else {
    // Calculate review time if startedAt exists on submission
    review = await prisma.review.create({
      data: {
        submissionId,
        profileId: markerId,
        total,
        feedback: feedback || '',
        scores: scoresJson,
        status: 'DRAFT',
        startedAt: now,
      },
    });
  }

  res.json({ ok: true, reviewId: review.id, status: review.status });
});

// PUT /api/reviews/:id - Update a review (draft only, marker-owned)
router.put('/:id', authenticate, requireRoles('MARKER', 'ADMINISTRATOR', 'OWNER'), requireMembership, csrfProtection, async (req, res) => {
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_review' });
  }

  const { scores, feedback, total } = parsed.data;
  const markerId = (req as any).profile!.id;

  const existing = await prisma.review.findFirst({
    where: {
      id: req.params.id,
      profileId: markerId,
      status: 'DRAFT',
    },
  });

  if (!existing) {
    return res.status(404).json({ error: 'draft_not_found' });
  }

  const review = await prisma.review.update({
    where: { id: req.params.id },
    data: {
      scores: JSON.stringify(scores),
      feedback: feedback || '',
      total,
    },
  });

  res.json({ ok: true, reviewId: review.id });
});

// POST /api/reviews/:id/claim - Claim a submission for review
router.post('/:id/claim', authenticate, requireRoles('MARKER', 'ADMINISTRATOR', 'OWNER'), requireMembership, csrfProtection, async (req, res) => {
  const markerId = (req as any).profile!.id;

  const submission = await prisma.submission.findUnique({
    where: { id: req.params.id },
    include: { review: true },
  });

  if (!submission) {
    return res.status(404).json({ error: 'submission_not_found' });
  }

  if (submission.review) {
    return res.status(400).json({ error: 'already_claimed' });
  }

  // Create a draft review to "claim" the submission
  const now = new Date();
  const review = await prisma.review.create({
    data: {
      submissionId: req.params.id,
      profileId: markerId,
      total: 0,
      feedback: '',
      scores: '[]',
      status: 'DRAFT',
      startedAt: now,
    },
  });

  res.json({ ok: true, reviewId: review.id, claimed: true });
});

// POST /api/reviews/publish - Publish review (from draft or new)
router.post('/publish', authenticate, requireRoles('MARKER', 'ADMINISTRATOR', 'OWNER'), requireMembership, csrfProtection, async (req, res) => {
  const parsed = reviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_review' });
  }

  const { submissionId, scores, feedback, total } = parsed.data;
  const markerId = (req as any).profile!.id;
  const scoresJson = JSON.stringify(scores);
  const now = new Date();

  // Check if there's an existing draft for this submission by this marker
  const existingDraft = await prisma.review.findFirst({
    where: {
      submissionId,
      profileId: markerId,
      status: 'DRAFT',
    },
  });

  let review;
  let reviewTimeMinutes: number | null = null;

  if (existingDraft) {
    // Update existing draft to published
    const startedAt = existingDraft.startedAt;
    if (startedAt) {
      reviewTimeMinutes = Math.round((now.getTime() - startedAt.getTime()) / 1000 / 60);
    }

    review = await prisma.review.update({
      where: { id: existingDraft.id },
      data: {
        scores: scoresJson,
        feedback: feedback || '',
        total,
        status: 'PUBLISHED',
        publishedAt: now,
        reviewTimeMinutes,
        updatedAt: now,
      },
    });
  } else {
    // Create new published review
    review = await prisma.review.create({
      data: {
        submissionId,
        profileId: markerId,
        total,
        feedback: feedback || '',
        scores: scoresJson,
        status: 'PUBLISHED',
        publishedAt: now,
        startedAt: now,
        reviewTimeMinutes: null,
      },
    });
  }

  await prisma.submission.update({
    where: { id: submissionId },
    data: { status: 'MARKED' },
  });

  // Send feedback published email (non-blocking)
  try {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { profile: true, task: true },
    });
    if (submission?.profile && submission.taskId) {
      const taskForEmail = await prisma.task.findUnique({
        where: { id: submission.taskId },
      });
      const rubric = await prisma.rubric.findUnique({
        where: { taskId: submission.taskId },
      });
      if (taskForEmail) {
        sendEmail(feedbackPublishedEmail(
          submission.profile.email,
          submission.profile.displayName || 'Student',
          taskForEmail.title,
          review.total ?? 0,
          rubric?.maxScore ?? 0
        )).catch(() => {});
      }
    }
  } catch {
    // email failure must not block
  }

  res.json({ ok: true, reviewId: review.id, reviewTimeMinutes });
});

// GET /api/reviews/:id - Get a specific review (for marker edit view)
router.get('/:id', authenticate, requireRoles('MARKER', 'ADMINISTRATOR', 'OWNER'), requireMembership, async (req, res) => {
  const markerId = (req as any).profile!.id;

  const review = await prisma.review.findFirst({
    where: {
      id: req.params.id,
      profileId: markerId,
    },
    include: {
      submission: {
        include: {
          task: { select: { id: true, title: true, practiceArea: true } },
          profile: { select: { id: true, displayName: true } },
        },
      },
    },
  });

  if (!review) {
    return res.status(404).json({ error: 'review_not_found' });
  }

  const scores = JSON.parse(review.scores || '[]');

  res.json({
    review: {
      id: review.id,
      submissionId: review.submissionId,
      scores: scores.map((s: any) => ({
        criterionId: s.criterionId || s.criterion_id,
        score: s.score,
        comment: s.comment || '',
      })),
      feedback: review.feedback,
      total: review.total,
      status: review.status,
      startedAt: review.startedAt,
      publishedAt: review.publishedAt,
      reviewTimeMinutes: review.reviewTimeMinutes,
    },
    submission: review.submission,
  });
});

export default router;
