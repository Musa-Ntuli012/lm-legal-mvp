import { Router } from 'express';
import { authenticate, requireMembership } from '../middleware/auth';
import { prisma } from '../db';

const router = Router();

// ============================================
// GET /api/progress
// Get the authenticated student's progress statistics.
// ============================================

/**
 * GET /api/progress
 * Requires authentication + ACTIVE membership.
 *
 * Returns progress statistics for the authenticated student:
 * - totalSubmissions: Total number of submissions.
 * - submittedCount: Number of submissions with SUBMITTED status.
 * - reviewedCount: Number of submissions with a published review.
 * - averageScore: Average of published review scores (0 if none).
 *
 * Used by the Portfolio page to show overall progress.
 */
router.get('/', authenticate, requireMembership, async (req, res) => {
  const profileId = (req as any).profile!.id;

  const submissions = await prisma.submission.findMany({
    where: { profileId },
    include: {
      review: { select: { total: true, status: true } },
    },
  });

  const totalSubmissions = submissions.length;
  const submittedCount = submissions.filter((s: { status: string }) => s.status === 'SUBMITTED').length;
  const reviewedCount = submissions.filter((s: { review?: { status: string } | null }) => s.review?.status === 'PUBLISHED').length;

  const scores = submissions
    .filter((s: { review?: { status: string } | null }) => s.review?.status === 'PUBLISHED')
    .map((s: { review?: { total: number | null } | null }) => s.review!.total)
    .filter((score: number | null) => score !== null);

  const averageScore =
    scores.length > 0 ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length : 0;

  res.json({
    totalSubmissions,
    submittedCount,
    reviewedCount,
    averageScore: Math.round(averageScore * 10) / 10,
  });
});

export default router;
