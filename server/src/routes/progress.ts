import { Router } from 'express';
import { authenticate, requireMembership } from '../middleware/auth';
import { csrfProtection } from '../middleware/csrf';
import { prisma } from '../db';

const router = Router();

// GET /api/progress - Get current user's progress records
router.get('/', authenticate, requireMembership, async (req, res) => {
  const profileId = (req as any).profile!.id;

  const progress = await prisma.progress.findMany({
    where: { profileId },
    include: {
      task: {
        select: {
          id: true,
          title: true,
          practiceArea: true,
          status: true,
          releaseAt: true,
          deadlineAt: true,
        },
      },
      submission: {
        select: {
          id: true,
          status: true,
          submittedAt: true,
          late: true,
          wordCount: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  res.json({ progress });
});

// GET /api/progress/:taskId - Get progress for a specific task
router.get('/:taskId', authenticate, requireMembership, async (req, res) => {
  const profileId = (req as any).profile!.id;

  const progress = await prisma.progress.findFirst({
    where: {
      profileId,
      taskId: req.params.taskId,
    },
    include: {
      task: true,
      submission: true,
    },
  });

  if (!progress) {
    return res.status(404).json({ error: 'progress_not_found' });
  }

  res.json({ progress });
});

export default router;
