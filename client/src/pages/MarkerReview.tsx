import { useState } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';

const RUBRIC_ITEMS = [
  { id: 'r1', criterion: 'Identifies legal issues', maxScore: 30, score: 25, comment: 'Clear identification of the main issues.' },
  { id: 'r2', criterion: 'Applies the law', maxScore: 40, score: 32, comment: 'Good application of the Labour Relations Act.' },
  { id: 'r3', criterion: 'Structure and clarity', maxScore: 30, score: 15, comment: 'Structure could be improved. Use headings.' },
];

export function MarkerReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showCalibration, setShowCalibration] = useState(false);

  const totalScore = RUBRIC_ITEMS.reduce((acc, r) => acc + r.score, 0);
  const totalMax = RUBRIC_ITEMS.reduce((acc, r) => acc + r.maxScore, 0);

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-deep">
      <header className="bg-raised border-b border-border-control flex-shrink-0">
        <div className="max-w-[1400px] mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/marker/queue')} className="flex items-center gap-2 text-text-secondary hover:text-primary">
              <span className="w-8 h-8 rounded bg-raised border border-border-control flex items-center justify-center text-xs font-bold">
                <span>&lt;</span>
              </span>
              <span className="hidden sm:inline">Queue</span>
            </button>
            <div className="flex items-center gap-2 text-xl font-bold text-primary tracking-tight">
              <span className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold text-lg">
                LM
              </span>
              <span>LM Legal</span>
            </div>
          </div>
          <div className="text-sm text-text-secondary">
            Review submission
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] mx-auto px-4 py-6 page-enter animate-fade-in">
        <div className="flex flex-col lg:flex-row gap-6">
          <nav className="w-full lg:w-80 flex-shrink-0">
            <div className="card mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded bg-raised border border-border-control flex items-center justify-center text-primary font-bold">
                  S
                </div>
                <div>
                  <p className="text-body font-semibold">A. Nkosi</p>
                  <p className="text-caption-13 text-text-muted">student@example.org</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b border-border-control pb-2">
                  <span className="text-text-muted">Matter</span>
                  <span className="text-text-deep font-semibold">Employment dispute memo</span>
                </div>
                <div className="flex justify-between border-b border-border-control pb-2">
                  <span className="text-text-muted">Submitted</span>
                  <span className="text-text-deep font-semibold font-mono">Fri 7 Jun 2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Word count</span>
                  <span className="text-text-deep font-semibold">245 words</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h4 className="text-body font-semibold mb-4">Marker tools</h4>
              <div className="space-y-2">
                <button className="btn btn-secondary btn-full text-left justify-start py-3">
                  View rubric
                </button>
                <button className="btn btn-secondary btn-full text-left justify-start py-3">
                  Model answer
                </button>
                <button
                  onClick={() => setShowCalibration(true)}
                  className="btn btn-outline btn-full text-left justify-start py-3"
                >
                  Calibration notes
                </button>
              </div>
            </div>
          </nav>

          <section className="flex-1 space-y-6">
            <div className="card">
              <h3 className="text-body font-semibold mb-4">Student submission</h3>
              <div className="p-6 rounded bg-raised border border-border-control text-body max-h-[400px] overflow-y-auto">
                <p>
                  Your client is a small business owner who received a letter from a former employee claiming unfair dismissal. The employee worked for eighteen months and was dismissed without a disciplinary hearing. Your client says the employee was underperforming but admits no formal process was followed.
                </p>
                <p>
                  Prepare a memo of between two hundred and three hundred words that identifies the legal issues, explains the applicable law under the Labour Relations Act, and advises your client on the likely outcome if the matter proceeds to the CCMA.
                </p>
              </div>
            </div>

            <div className="card">
              <h3 className="text-body font-semibold mb-4">Marking rubric</h3>
              <div className="space-y-4">
                {RUBRIC_ITEMS.map((r) => (
                  <div key={r.id} className="p-3 rounded bg-raised border border-border-control">
                    <div className="flex justify-between mb-2">
                      <span className="text-body font-semibold">{r.criterion}</span>
                      <span className="text-caption-13 text-text-muted font-mono">{r.score} / {r.maxScore}</span>
                    </div>
                    <div className="w-full bg-sunken rounded h-2 mb-2 overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: `${(r.score / r.maxScore) * 100}%` }}></div>
                    </div>
                    <p className="text-caption-13 text-text-secondary">{r.comment}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-border-control">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-title font-bold">Total score</span>
                  <span className="text-2xl font-bold text-primary">{totalScore} / {totalMax}</span>
                </div>
                <div className="space-y-3">
                  <label className="label" htmlFor="marker-comment">Marker comment</label>
                  <textarea
                    id="marker-comment"
                    className="input min-h-[100px]"
                    defaultValue="Well structured memo with clear identification of the legal issues. Your application of the Labour Relations Act is sound. Consider addressing the procedural fairness requirements in more detail in future submissions."
                  ></textarea>
                </div>
                <div className="flex gap-3 mt-4">
                  <button className="btn btn-secondary btn-lg elevate flex-1">
                    Save draft
                  </button>
                  <button className="btn btn-primary btn-lg elevate flex-1">
                    Publish marks
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {showCalibration && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center page-enter animate-fade-in">
          <div className="bg-raised border border-border-control rounded-lg p-8 max-w-md w-full shadow-shadow-md">
            <h3 className="text-title mb-6">Calibration notes</h3>
            <div className="space-y-4 text-body mb-6">
              <p>
                Calibration ensures consistent marking across all markers. Before publishing, compare your scores with the model answer and the calibration benchmarks.
              </p>
              <ul className="list-disc list-inside space-y-2 text-text-secondary">
                <li>Score each criterion independently before totaling.</li>
                <li>Use the full range of marks where warranted.</li>
                <li>Check borderline cases against the model answer.</li>
              </ul>
            </div>
            <button
              onClick={() => setShowCalibration(false)}
              className="btn btn-secondary"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <footer className="border-t border-border-control bg-raised py-8 flex-shrink-0">
        <div className="max-w-[1400px] mx-auto px-4 text-center">
          <p className="text-caption-13 text-text-muted">LM Legal built for South African law graduates</p>
        </div>
      </footer>
    </div>
  );
}
