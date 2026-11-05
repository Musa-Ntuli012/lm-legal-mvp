import { NavLink } from 'react-router-dom';

/**
 * How It Works page.
 *
 * Explains the end-to-end flow for students, markers, and administrators.
 * Linked from the LandingPage "See how it works" button.
 *
 * Design constraints honored:
 * - No dashes, emojis, or icons in visible text.
 * - Geist typography scale (Display, Title, Body, Caption).
 * - 44x44px touch targets on all buttons.
 * - Light theme default with dark theme support.
 */
export function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-deep">

      <main className="flex-1 max-w-[1400px] mx-auto px-4 py-12 page-enter animate-fade-in">

        {/* Page title */}
        <div className="mb-12">
          <h1 className="text-display mb-4">How it works</h1>
          <p className="text-body text-text-secondary max-w-2xl">
            LM Legal is a practical legal training platform. Students work through real
            legal matters, submit memos, and receive rubric based feedback from practising
            markers. Markers review and score submissions. Administrators manage users,
            tasks, and the audit trail.
          </p>
        </div>

        {/* Student flow */}
        <section className="mb-16 card">
          <div className="mb-8">
            <h2 className="text-title mb-4">For students</h2>
            <p className="text-body text-text-secondary">
              As a student you receive an invite code from your institution. Once you
              create your account you can access matters, submit work, and view your
              marked feedback.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                num: '1',
                title: 'Accept your invite',
                desc: 'Use the invite code from your institution to create your account.',
              },
              {
                num: '2',
                title: 'Read the brief',
                desc: 'Open the matter and read the client email and case documents.',
              },
              {
                num: '3',
                title: 'Work the matter',
                desc: 'Answer the questions, draft your memo, and submit before Friday.',
              },
              {
                num: '4',
                title: 'Get marked feedback',
                desc: 'View your rubric based score and written comments from your marker.',
              },
            ].map((step) => (
              <div
                key={step.title}
                className="page-enter animate-fade-in"
                style={{ animationDelay: `${100 * (['1', '2', '3', '4'].indexOf(step.num) + 1)}ms` }}
              >
                <div className="w-10 h-10 rounded bg-primary flex items-center justify-center text-white font-bold text-lg mb-4">
                  {step.num}
                </div>
                <h4 className="text-body font-semibold mb-2">{step.title}</h4>
                <p className="text-caption-13 text-text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Marker flow */}
        <section className="mb-16 card">
          <div className="mb-8">
            <h2 className="text-title mb-4">For markers</h2>
            <p className="text-body text-text-secondary">
              Markers review student submissions in the marking queue, score each
              criterion against the rubric, add written comments, and publish marks.
              Blind marking hides student identities during review.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                num: '1',
                title: 'Open the queue',
                desc: 'View unmarked submissions assigned to you.',
              },
              {
                num: '2',
                title: 'Review the submission',
                desc: 'Read the student memo and compare against the model answer.',
              },
              {
                num: '3',
                title: 'Score each criterion',
                desc: 'Assign marks per rubric criterion and write feedback comments.',
              },
              {
                num: '4',
                title: 'Publish marks',
                desc: 'Release the total score and feedback to the student.',
              },
            ].map((step) => (
              <div
                key={step.title}
                className="page-enter animate-fade-in"
                style={{ animationDelay: `${100 * (['1', '2', '3', '4'].indexOf(step.num) + 1)}ms` }}
              >
                <div className="w-10 h-10 rounded bg-primary flex items-center justify-center text-white font-bold text-lg mb-4">
                  {step.num}
                </div>
                <h4 className="text-body font-semibold mb-2">{step.title}</h4>
                <p className="text-caption-13 text-text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Administrator flow */}
        <section className="mb-16 card">
          <div className="mb-8">
            <h2 className="text-title mb-4">For administrators</h2>
            <p className="text-body text-text-secondary">
              Administrators manage the platform: create and publish tasks, invite
              users and markers, review the audit log, and export reports.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                num: '1',
                title: 'Create tasks',
                desc: 'Build tasks in the task builder with title, prompt, rubric, and model answer.',
              },
              {
                num: '2',
                title: 'Invite users',
                desc: 'Send invitation codes to students and markers at your institution.',
              },
              {
                num: '3',
                title: 'Monitor progress',
                desc: 'View cohort statistics and recent activity on the admin dashboard.',
              },
              {
                num: '4',
                title: 'Review audit log',
                desc: 'Check the complete record of administrative actions for compliance.',
              },
            ].map((step) => (
              <div
                key={step.title}
                className="page-enter animate-fade-in"
                style={{ animationDelay: `${100 * (['1', '2', '3', '4'].indexOf(step.num) + 1)}ms` }}
              >
                <div className="w-10 h-10 rounded bg-primary flex items-center justify-center text-white font-bold text-lg mb-4">
                  {step.num}
                </div>
                <h4 className="text-body font-semibold mb-2">{step.title}</h4>
                <p className="text-caption-13 text-text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Call to action */}
        <section className="card">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-title mb-4">Ready to start?</h2>
              <p className="text-body mb-6">
                Request an invite from your institution administrator and begin
                practising legal work today.
              </p>
            </div>
            <div className="flex justify-end">
              <NavLink to="/signup" className="btn btn-primary btn-lg elevate">
                Request an invite
              </NavLink>
            </div>
          </div>
        </section>

      </main>

    </div>
  );
}
