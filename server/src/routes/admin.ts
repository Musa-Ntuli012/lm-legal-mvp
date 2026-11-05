import { Router } from 'express';
import { authenticate, requireRoles, requireMembership } from '../middleware/auth';
import { prisma } from '../db';

const router = Router();

// ============================================
// GET /api/admin/overview
// Cohort statistics dashboard for administrators.
// ============================================

/**
 * GET /api/admin/overview
 * Requires authentication + ACTIVE membership + ADMINISTRATOR or OWNER role.
 *
 * Returns cohort statistics:
 * - total: Total number of student profiles.
 * - active: Number of students with ACTIVE membership status.
 * - submitted: Total number of submitted submissions.
 *
 * Used by the AdminDashboard page to display high-level metrics.
 */
router.get('/overview', authenticate, requireRoles('ADMINISTRATOR', 'OWNER'), requireMembership, async (req, res) => {
  const total = await prisma.profile.count({ where: { role: 'STUDENT' } });
  const active = await prisma.profile.count({
    where: { role: 'STUDENT', membershipStatus: 'ACTIVE' },
  });
  const submitted = await prisma.submission.count({
    where: { status: 'SUBMITTED' },
  });

  res.json({ total, active, submitted });
});

export default router;
