import nodemailer, { Transporter } from 'nodemailer';

/**
 * Email service for LM Legal MVP.
 *
 * Sends transactional emails (password reset, email verification, submission
 * confirmation) via SMTP. All email sends are non-blocking — callers use
 * .catch(() => {}) so email failures never break the request flow.
 *
 * SMTP configuration comes from environment variables:
 * - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 *
 * If no SMTP is configured, emails are silently dropped (dev mode).
 */

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!transporter && process.env.SMTP_HOST) {
    const transportConfig: {
      host: string;
      port: number;
      secure: boolean;
      auth?: { user: string; pass: string };
    } = {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_PORT === '465',
    };

    // Only include auth credentials when SMTP_USER is set.
    if (process.env.SMTP_USER) {
      transportConfig.auth = {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS ?? '',
      };
    }

    transporter = nodemailer.createTransport(transportConfig);
  }
  return transporter;
}

/**
 * Email options accepted by sendEmail.
 */
interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Sends an email via SMTP.
 *
 * Accepts an options object (matching the shape returned by the email
 * template functions) so callers can do:
 *   sendEmail(passwordResetEmail(to, name, url))
 *
 * @param opts - Email options (to, subject, text, optional html).
 * @returns Promise that resolves when sent (or resolves if no transporter configured).
 */
export async function sendEmail(opts: EmailOptions): Promise<void> {
  const transport = getTransporter();
  if (!transport) {
    // No SMTP configured — silently drop in development.
    console.log(`[Email skipped] To: ${opts.to} | Subject: ${opts.subject}`);
    return;
  }

  await transport.sendMail({
    from: process.env.SMTP_FROM || 'noreply@lmlegal.demo',
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });
}

/**
 * Password reset email content.
 *
 * @param to - Recipient email.
 * @param name - Recipient's display name.
 * @param resetUrl - Password reset link with token.
 * @returns Email options for sendEmail.
 */
export function passwordResetEmail(to: string, name: string, resetUrl: string) {
  return {
    to,
    subject: 'Reset your LM Legal password',
    text: `Hi ${name},\n\nYou requested a password reset for your LM Legal account.\n\nClick the link below to create a new password:\n${resetUrl}\n\nThis link expires in 30 minutes.\n\nIf you did not request this, you can ignore this email.\n\n— The LM Legal team`,
  };
}

/**
 * Email verification email content.
 *
 * @param to - Recipient email.
 * @param name - Recipient's display name.
 * @param verifyUrl - Email verification link with token.
 * @returns Email options for sendEmail.
 */
export function emailVerificationEmail(to: string, name: string, verifyUrl: string) {
  return {
    to,
    subject: 'Verify your LM Legal email address',
    text: `Hi ${name},\n\nThank you for creating an LM Legal account.\n\nClick the link below to verify your email address:\n${verifyUrl}\n\nThis link expires in 7 days.\n\n— The LM Legal team`,
  };
}

/**
 * Feedback published email content.
 *
 * @param to - Recipient email.
 * @param name - Recipient's display name.
 * @param taskTitle - Title of the marked task.
 * @param totalScore - The total score awarded.
 * @param maxScore - The maximum possible score (optional; omitted when unavailable).
 * @returns Email options for sendEmail.
 */
export function feedbackPublishedEmail(
  to: string,
  name: string,
  taskTitle: string,
  totalScore: number,
  maxScore?: number
) {
  const scoreLine = maxScore !== undefined
    ? `Your score: ${totalScore} / ${maxScore}.\n`
    : `Your score: ${totalScore}.\n`;

  return {
    to,
    subject: `Feedback published: ${taskTitle}`,
    text: `Hi ${name},\n\nYour submission for "${taskTitle}" has been marked.\n\n${scoreLine}Log in to view your detailed feedback.\n\n— The LM Legal team`,
  };
}

/**
 * Submission confirmation email content.
 *
 * @param to - Recipient email.
 * @param name - Recipient's display name.
 * @param taskTitle - Title of the submitted task.
 * @param submittedAt - Submission timestamp.
 * @param late - Whether the submission was late.
 * @returns Email options for sendEmail.
 */
export function submissionConfirmationEmail(
  to: string,
  name: string,
  taskTitle: string,
  submittedAt: Date,
  late: boolean
) {
  const submittedAtSA = submittedAt.toLocaleString('en-ZA', {
    timeZone: 'Africa/Johannesburg',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

  return {
    to,
    subject: `Submission received: ${taskTitle}`,
    text: `Hi ${name},\n\nWe received your submission for "${taskTitle}" on ${submittedAtSA} (South African time).\n${late ? 'Note: This submission was submitted after the deadline.' : ''}\n\nYou will receive feedback from your marker once it has been reviewed.\n\n— The LM Legal team`,
  };
}
