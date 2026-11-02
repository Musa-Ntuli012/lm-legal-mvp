import { Router } from 'express';
import { authenticate, requireMembership } from '../middleware/auth';
import { csrfProtection } from '../middleware/csrf';
import { prisma } from '../db';
import { z } from 'zod';
import { sendEmail, submissionConfirmationEmail } from '../services/emailService';

const router = Router();

const submitSchema = z.object({
  memo: z.string().min(1, 'Memo is required'),
  decision: z.string().optional(),
});

// GET /api/submissions - List user's submissions
router.get('/', authenticate, requireMembership, async (req, res) => {
  const submissions = await prisma.submission.findMany({
    where: { profileId: (req as any).profile!.id },
    orderBy: { createdAt: 'desc' },
    include: {
      task: { select: { id: true, title: true, practiceArea: true } },
      review: { select: { id: true, total: true, status: true } },
    },
  });
  res.json({ submissions });
});

// POST /api/submissions - Submit a memo
router.post('/', authenticate, requireMembership, csrfProtection, async (req, res) => {
  const parsed = submitSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_submission' });
  }

  const profileId = (req as any).profile!.id;

  // Get the latest published task with its current version
  const task = await prisma.task.findFirst({
    where: {
      status: 'PUBLISHED',
      releaseAt: { lte: new Date() },
    },
    include: {
      versions: { where: { isCurrent: true }, take: 1 },
    },
    orderBy: { releaseAt: 'desc' },
  });

  if (!task || !task.versions || task.versions.length === 0) {
    return res.status(404).json({ error: 'no_active_task' });
  }

  const taskVersionId = task.versions[0].id;

  // Check for existing submission (idempotency)
  const existing = await prisma.submission.findFirst({
    where: { taskId: task.id, profileId },
  });

  if (existing && existing.status === 'SUBMITTED') {
    return res.status(400).json({ error: 'already_submitted' });
  }

  const now = new Date();
  const late = !!(task.deadlineAt && now > new Date(task.deadlineAt));

  const submission = await prisma.submission.create({
    data: {
      taskId: task.id,
      profileId,
      taskVersionId,
      memo: parsed.data.memo,
      decision: parsed.data.decision,
      wordCount: parsed.data.memo.split(/\s+/).filter(Boolean).length,
      late,
      status: 'SUBMITTED',
      submittedAt: now,
    },
  });

  // Send submission confirmation email (non-blocking)
  try {
    const profile = await prisma.profile.findUnique({ where: { id: profileId } });
    if (profile) {
      sendEmail(submissionConfirmationEmail(
        profile.email,
        profile.displayName || 'Student',
        task.title,
        now,
        late
      )).catch(() => {}); // never block on email failure
    }
  } catch {
    // email failure must not break submission
  }

  res.json({ ok: true, submission_id: submission.id, late });
});

export default router;
