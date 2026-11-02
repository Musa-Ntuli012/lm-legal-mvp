import { Router } from 'express';
import { authenticate, requireRoles, requireMembership } from '../middleware/auth';
import { prisma } from '../db';

const router = Router();

// GET /api/admin/overview - Cohort overview
router.get('/overview', authenticate, requireRoles('ADMINISTRATOR', 'OWNER'), requireMembership, async (req, res) => {
  const total = await prisma.profile.count({ where: { role: 'STUDENT' } });
  const active = await prisma.profile.count({
    where: { role: 'STUDENT', membershipStatus: 'ACTIVE' },
  });
  const submitted = await prisma.submission.count({
    where: { status: 'SUBMITTED' },
  });
  const marked = await prisma.submission.count({
    where: { status: 'MARKED' },
  });

  res.json({
    totalStudents: total,
    activeStudents: active,
    pendingSubmissions: submitted,
    markedSubmissions: marked,
  });
});

// GET /api/admin/markers - List markers
router.get('/markers', authenticate, requireRoles('ADMINISTRATOR', 'OWNER'), requireMembership, async (req, res) => {
  const markers = await prisma.profile.findMany({
    where: { role: 'MARKER' },
    select: { id: true, email: true, displayName: true, membershipStatus: true, createdAt: true },
  });
  res.json({ markers });
});

export default router;
