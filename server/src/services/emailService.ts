/**
 * Email service for LM Legal MVP.
 *
 * In development, emails are written to the console (and to a log file) so they
 * can be inspected without an SMTP server. In production, replace the transport
 * with a real SMTP/SES/SendGrid provider.
 *
 * All functions return { ok: true } on success and never throw — email delivery
 * must never block a user action.
 */

const EMAIL_LOG = '/tmp/lm-legal-emails.log';

function logEmail(to: string, subject: string, body: string) {
  const entry = {
    at: new Date().toISOString(),
    to,
    subject,
    body,
  };
  console.log(`[EMAIL] ${JSON.stringify(entry)}`);
  try {
    const fs = require('fs');
    fs.appendFileSync(EMAIL_LOG, JSON.stringify(entry) + '\n');
  } catch {
    // best effort only
  }
}

/**
 * Send an email. Returns { ok: true } always.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}) {
  logEmail(to, subject, html || text || '');
  return { ok: true };
}

/**
 * Email templates used across the MVP.
 */

export function submissionConfirmationEmail(
  to: string,
  studentName: string,
  taskTitle: string,
  submittedAt: Date,
  late: boolean
) {
  const timeStr = submittedAt.toLocaleString('en-ZA', {
    timeZone: 'Africa/Johannesburg',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    to,
    subject: `Submission confirmed — ${taskTitle}`,
    html: `
      <h2>Submission confirmed</h2>
      <p>Dear ${studentName},</p>
      <p>Your submission for <strong>${taskTitle}</strong> has been received.</p>
      <p><strong>Submitted at:</strong> ${timeStr} (South African time)</p>
      <p>${late ? '<strong style="color:red">This submission was received after the deadline and is marked as late.</strong>' : 'This submission was received before the deadline.'}</p>
      <p>You will receive an email when your marker publishes feedback.</p>
      <p>— The LM Legal team</p>
    `,
    text: `
Submission confirmed

Dear ${studentName},

Your submission for "${taskTitle}" has been received.

Submitted at: ${timeStr} (South African time)
${late ? 'This submission was received after the deadline and is marked as late.' : 'This submission was received before the deadline.'}

You will receive an email when your marker publishes feedback.

— The LM Legal team
    `,
  };
}

export function feedbackPublishedEmail(
  to: string,
  studentName: string,
  taskTitle: string,
  total: number,
  maxScore: number
) {
  return {
    to,
    subject: `Feedback published — ${taskTitle}`,
    html: `
      <h2>Feedback published</h2>
      <p>Dear ${studentName},</p>
      <p>Your marker has published feedback for <strong>${taskTitle}</strong>.</p>
      <p><strong>Your mark:</strong> ${total} / ${maxScore}</p>
      <p>Log in to LM Legal to read the full feedback and rubric scores.</p>
      <p>— The LM Legal team</p>
    `,
    text: `
Feedback published

Dear ${studentName},

Your marker has published feedback for "${taskTitle}".

Your mark: ${total} / ${maxScore}

Log in to LM Legal to read the full feedback and rubric scores.

— The LM Legal team
    `,
  };
}

export function modelAnswerReleasedEmail(
  to: string,
  studentName: string,
  taskTitle: string
) {
  return {
    to,
    subject: `Model answer released — ${taskTitle}`,
    html: `
      <h2>Model answer released</h2>
      <p>Dear ${studentName},</p>
      <p>The model answer for <strong>${taskTitle}</strong> has been released.</p>
      <p>Log in to LM Legal to view it alongside your own submission.</p>
      <p>— The LM Legal team</p>
    `,
    text: `
Model answer released

Dear ${studentName},

The model answer for "${taskTitle}" has been released.

Log in to LM Legal to view it alongside your own submission.

— The LM Legal team
    `,
  };
}

export function passwordResetEmail(
  to: string,
  studentName: string,
  resetUrl: string
) {
  return {
    to,
    subject: 'Reset your LM Legal password',
    html: `
      <h2>Reset your password</h2>
      <p>Dear ${studentName},</p>
      <p>You requested a password reset for your LM Legal account.</p>
      <p><a href="${resetUrl}">Click here to reset your password</a></p>
      <p>This link is valid for 30 minutes. If you did not request this, please ignore this email.</p>
      <p>— The LM Legal team</p>
    `,
    text: `
Reset your password

Dear ${studentName},

You requested a password reset for your LM Legal account.

Click here to reset your password: ${resetUrl}

This link is valid for 30 minutes. If you did not request this, please ignore this email.

— The LM Legal team
    `,
  };
}

export function emailVerificationEmail(
  to: string,
  studentName: string,
  verifyUrl: string
) {
  return {
    to,
    subject: 'Verify your LM Legal email address',
    html: `
      <h2>Verify your email</h2>
      <p>Dear ${studentName},</p>
      <p>Welcome to LM Legal. Please verify your email address to activate your account.</p>
      <p><a href="${verifyUrl}">Click here to verify your email</a></p>
      <p>This link is valid for 7 days.</p>
      <p>— The LM Legal team</p>
    `,
    text: `
Verify your email

Dear ${studentName},

Welcome to LM Legal. Please verify your email address to activate your account.

Click here to verify your email: ${verifyUrl}

This link is valid for 7 days.

— The LM Legal team
    `,
  };
}
