import { Router } from 'express';
import { authenticate, requireRoles, requireMembership } from '../middleware/auth';
import { csrfProtection } from '../middleware/csrf';
import { prisma } from '../db';
import { z } from 'zod';

const router = Router();

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  practiceArea: z.string().optional(),
  deadlineAt: z.string().optional(), // ISO date string
  releaseAt: z.string().optional(),  // ISO date string
});

// ============================================
// GET /api/tasks
// List published tasks for the current context.
// ============================================

/**
 * GET /api/tasks
 * Requires authentication + ACTIVE membership.
 *
 * Returns all tasks released before now, ordered by release date (newest first).
 * Used by students to see available matters and by markers to see what to mark.
 */
router.get('/', authenticate, requireMembership, async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: {
      status: 'PUBLISHED',
      releaseAt: { lte: new Date() },
    },
    orderBy: { releaseAt: 'desc' },
    include: {
      versions: { where: { isCurrent: true }, take: 1 },
    },
  });

  res.json({ tasks });
});

// ============================================
// POST /api/tasks
// Create a new task (administrator only).
// ============================================

/**
 * POST /api/tasks
 * Requires authentication + ADMINISTRATOR or OWNER role.
 * CSRF-protected.
 *
 * Creates a new task with title, description, practice area, deadline, and
 * release date. Used by the TaskBuilder page.
 *
 * Body: { title, description?, practiceArea?, deadlineAt?, releaseAt? }
 */
router.post('/', authenticate, requireRoles('ADMINISTRATOR', 'OWNER'), csrfProtection, async (req, res) => {
  const parsed = taskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_task' });
  }

  const task = await prisma.task.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description || '',
      practiceArea: parsed.data.practiceArea || '',
      deadlineAt: parsed.data.deadlineAt ? new Date(parsed.data.deadlineAt) : null,
      releaseAt: parsed.data.releaseAt ? new Date(parsed.data.releaseAt) : new Date(),
      status: 'PUBLISHED',
      creatorId: (req as any).profile!.id,
    },
  });

  res.json({ ok: true, taskId: task.id });
});

export default router;
