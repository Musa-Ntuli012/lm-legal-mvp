import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { authenticate, requireMembership } from './middleware/auth';
import { prisma } from './db';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import submissionRoutes from './routes/submissions';
import reviewRoutes from './routes/reviews';
import progressRoutes from './routes/progress';
import adminRoutes from './routes/admin';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

const app = express();
const PORT = process.env.PORT || 3001;

// Security headers
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

// CORS - restricted to known origins in production
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Request logging
app.use(requestLogger);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);

// GET /api/feedback - Student's published feedback
app.get('/api/feedback', authenticate, requireMembership, async (req, res) => {
  const profileId = (req as any).profile!.id;
  const submissions = await prisma.submission.findMany({
    where: { profileId, review: { status: 'PUBLISHED' } },
    orderBy: { createdAt: 'desc' },
    include: {
      task: { select: { id: true, title: true, practiceArea: true } },
      review: { select: { id: true, total: true, feedback: true, scores: true, publishedAt: true } },
    },
  });

  if (submissions.length === 0) {
    return res.json({ none: true });
  }

  const latest = submissions[0];
  const review = latest.review;
  if (!review) {
    return res.json({ none: true });
  }
  const scores = JSON.parse(review.scores || '[]');

  res.json({
    total: review.total,
    comments: review.feedback,
    publishedAt: review.publishedAt,
    task: latest.task,
    scores: scores.map((s: any) => ({
      criterion_id: s.criterionId || s.criterion_id,
      score: s.score,
      comment: s.comment || '',
    })),
  });
});

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'not found' });
});

// Error handler
app.use(errorHandler);

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`LM Legal MVP API listening on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default server;
