// Shared types between client and server
// These types are used in API contracts and must stay in sync

export type Role = 'STUDENT' | 'MARKER' | 'ADMINISTRATOR' | 'OWNER';
export type MembershipStatus = 'ACTIVE' | 'INACTIVE' | 'UNKNOWN';
export type TaskStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
export type BlockType = 'SCENARIO' | 'EMAIL' | 'DOCUMENT' | 'QUESTION' | 'DECISION' | 'DRAFTING' | 'SUBMISSION';
export type ReleaseRule = 'AFTER_SUBMISSION' | 'AFTER_DEADLINE' | 'MANUAL' | 'AFTER_FEEDBACK_PUBLISHED';
export type SubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'MARKED';
export type ReviewStatus = 'DRAFT' | 'PUBLISHED';
export type ProgressStatus = 'AVAILABLE' | 'STARTED' | 'SUBMITTED' | 'LATE' | 'MARKED' | 'RELEASED';

export interface Profile {
  id: string;
  email: string;
  displayName: string;
  role: Role;
  membershipStatus: MembershipStatus;
  emailVerified: boolean;
  createdAt: string;
}

export interface Session {
  id: string;
  token: string;
  profileId: string;
  expiresAt: string;
}

export interface Task {
  id: string;
  title: string;
  practiceArea: string;
  description?: string;
  status: TaskStatus;
  releaseAt?: string;
  deadlineAt?: string;
  lateAcceptance: boolean;
  resubmissionAllowed: boolean;
  timeLimitMinutes?: number;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskVersion {
  id: string;
  taskId: string;
  version: number;
  blocks: any;
  rubric?: any;
  isCurrent: boolean;
}

export interface Block {
  id: string;
  taskId: string;
  type: BlockType;
  title?: string;
  content?: any;
  order: number;
  config?: any;
  branches?: any;
}

export interface RubricCriterion {
  id: string;
  name: string;
  weight: number;
  levelDescriptions: Record<string, string>;
}

export interface Rubric {
  id: string;
  taskId: string;
  criteria: RubricCriterion[];
  maxScore: number;
}

export interface ModelAnswer {
  id: string;
  taskId: string;
  content: string;
  explanation?: string;
  authorities?: string[];
  files?: string[];
  releaseRule: ReleaseRule;
  releasedAt?: string;
}

export interface Submission {
  id: string;
  taskId: string;
  profileId: string;
  taskVersionId: string;
  memo?: string;
  decision?: string;
  wordCount: number;
  late: boolean;
  submittedAt?: string;
  status: SubmissionStatus;
}

export interface Review {
  id: string;
  submissionId: string;
  profileId: string;
  total?: number;
  feedback?: string;
  scores: Array<{ criterionId: string; score: number; comment?: string }>;
  status: ReviewStatus;
  publishedAt?: string;
}

export interface Progress {
  id: string;
  profileId: string;
  taskId: string;
  submissionId?: string;
  status: ProgressStatus;
  mark?: number;
}

export interface AuditLog {
  id: string;
  profileId?: string;
  action: string;
  target?: string;
  detail?: string;
  createdAt: string;
}

// API Request/Response types
export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  ok: boolean;
  redirect?: string;
  error?: string;
  csrf_token?: string;
  user?: Profile;
}

export interface SignUpRequest {
  email: string;
  password: string;
  displayName: string;
}

export interface SignUpResponse {
  ok: boolean;
  redirect?: string;
  error?: string;
}

export interface CreateTaskRequest {
  title: string;
  practiceArea: string;
  description?: string;
  status?: TaskStatus;
  releaseAt?: string;
  deadlineAt?: string;
}

export interface CreateTaskResponse {
  ok: boolean;
  task?: Task;
  error?: string;
}

export interface SubmitReviewRequest {
  submissionId: string;
  scores: Array<{ criterionId: string; score: number; comment?: string }>;
  feedback?: string;
  total: number;
}

export interface PublishReviewResponse {
  ok: boolean;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Error types
export interface ApiError {
  error: string;
  detail?: string;
}

// No dashes in any user-facing string - use spaces or "to" instead
export const NO_DASH_TEXT = [
  'Sign in', 'Sign out', 'Sign up',
  'Back to dashboard', 'Create account',
  'Reset demo now', 'Unfair dismissal',
  '300 to 500 words',
] as const;
