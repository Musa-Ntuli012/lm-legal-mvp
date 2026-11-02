import { Router } from 'express';
import { authenticate, requireRoles, requireMembership } from '../middleware/auth';
import { csrfProtection } from '../middleware/csrf';
import { prisma } from '../db';
import { z } from 'zod';

const router = Router();

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  practiceArea: z.string().min(1, 'Practice area is required'),
  description: z.string().optional(),
  releaseAt: z.string().optional(),
  deadlineAt: z.string().optional(),
});

const addBlockSchema = z.object({
  type: z.enum(['SCENARIO', 'EMAIL', 'DOCUMENT', 'QUESTION', 'DECISION', 'DRAFTING', 'SUBMISSION']),
  title: z.string().optional(),
  content: z.string().optional(),
  config: z.string().optional(),
  branches: z.string().optional(),
  order: z.number().optional(),
});

// GET /api/tasks - List tasks
router.get('/', authenticate, requireMembership, async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: {
      status: 'PUBLISHED',
      releaseAt: { lte: new Date() },
    },
    orderBy: { releaseAt: 'desc' },
    include: {
      _count: { select: { submissions: true } },
    },
  });
  res.json({ tasks });
});

// GET /api/tasks/:id - Get single task
router.get('/:id', authenticate, requireMembership, async (req, res) => {
  const task = await prisma.task.findUnique({
    where: { id: req.params.id },
    include: {
      versions: { where: { isCurrent: true }, take: 1 },
      blocks: { orderBy: { order: 'asc' } },
      rubric: true,
      modelAnswer: true,
    },
  });

  if (!task) {
    return res.status(404).json({ error: 'task_not_found' });
  }

  // Check if task is published and released
  if (task.status !== 'PUBLISHED' || (task.releaseAt && new Date(task.releaseAt) > new Date())) {
    return res.status(404).json({ error: 'task_not_found' });
  }

  res.json({ task });
});

// GET /api/tasks/:id/blocks - List blocks (admin only)
router.get('/:id/blocks', authenticate, requireRoles('ADMINISTRATOR', 'OWNER'), async (req, res) => {
  const blocks = await prisma.block.findMany({
    where: { taskId: req.params.id },
    orderBy: { order: 'asc' },
  });
  res.json({ blocks });
});

// POST /api/tasks/:id/blocks - Add block (admin only)
router.post('/:id/blocks', authenticate, requireRoles('ADMINISTRATOR', 'OWNER'), csrfProtection, async (req, res) => {
  const parsed = addBlockSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_block' });
  }

  // Get max order
  const maxOrder = await prisma.block.aggregate({
    where: { taskId: req.params.id },
    _max: { order: true },
  });
  const order = parsed.data.order ?? ((maxOrder._max.order || 0) + 1);

  const block = await prisma.block.create({
    data: {
      taskId: req.params.id,
      type: parsed.data.type,
      title: parsed.data.title,
      content: parsed.data.content,
      config: parsed.data.config,
      branches: parsed.data.branches,
      order,
    },
  });

  res.json({ block });
});

// PUT /api/tasks/:id/blocks/:blockId - Update block (admin only)
router.put('/:id/blocks/:blockId', authenticate, requireRoles('ADMINISTRATOR', 'OWNER'), csrfProtection, async (req, res) => {
  const parsed = addBlockSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_block' });
  }

  const block = await prisma.block.update({
    where: { id: req.params.blockId, taskId: req.params.id },
    data: {
      type: parsed.data.type,
      title: parsed.data.title,
      content: parsed.data.content,
      config: parsed.data.config,
      branches: parsed.data.branches,
      order: parsed.data.order,
    },
  });

  res.json({ block });
});

// DELETE /api/tasks/:id/blocks/:blockId - Remove block (admin only)
router.delete('/:id/blocks/:blockId', authenticate, requireRoles('ADMINISTRATOR', 'OWNER'), csrfProtection, async (req, res) => {
  await prisma.block.delete({
    where: { id: req.params.blockId, taskId: req.params.id },
  });
  res.json({ ok: true });
});

// POST /api/tasks/:id/blocks/reorder - Reorder blocks (admin only)
router.post('/:id/blocks/reorder', authenticate, requireRoles('ADMINISTRATOR', 'OWNER'), csrfProtection, async (req, res) => {
  const { blockIds } = z.object({ blockIds: z.array(z.string()) }).parse(req.body);
  await prisma.$transaction(
    blockIds.map((id, index) =>
      prisma.block.update({
        where: { id, taskId: req.params.id },
        data: { order: index + 1 },
      })
    )
  );
  res.json({ ok: true });
});

// POST /api/tasks - Create task (admin only)
router.post('/', authenticate, requireRoles('ADMINISTRATOR', 'OWNER'), csrfProtection, async (req, res) => {
  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'invalid_task' });
  }

  const task = await prisma.task.create({
    data: {
      title: parsed.data.title,
      practiceArea: parsed.data.practiceArea,
      description: parsed.data.description,
      status: 'DRAFT',
      creatorId: (req as any).profile!.id,
    },
  });

  res.json({ task });
});

export default router;
