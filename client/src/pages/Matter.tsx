import { useState } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';

const MATTER_DOCUMENTS = [
  { id: '1', name: 'Client email - initial instruction.pdf', type: 'pdf', size: '245 KB' },
  { id: '2', name: 'Case summary - Smith v Jones.docx', type: 'docx', size: '89 KB' },
  { id: '3', name: 'Relevant statute extract.pdf', type: 'pdf', size: '512 KB' },
  { id: '4', name: 'Previous memo template.docx', type: 'docx', size: '45 KB' },
];

const MATTER_QUESTIONS = [
  {
    id: 'q1',
    text: 'Identify the legal issue in the client email and explain the applicable law.',
    type: 'essay',
    words: '200-300 words',
  },
  {
    id: 'q2',
    text: 'Draft a short memo to the advising attorney with your recommendations.',
    type: 'memo',
    words: '300-400 words',
  },
];

export function Matter() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('brief');
  const [showSubmit, setShowSubmit] = useState(false);

  const tabs = [
    { key: 'brief', label: 'Brief' },
    { key: 'documents', label: 'Documents' },
    { key: 'questions', label: 'Questions' },
    { key: 'feedback', label: 'Feedback' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-deep">
      <header className="bg-raised border-b border-border-control flex-shrink-0">
        <div className="max-w-[1400px] mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-text-secondary hover:text-primary">
              <span className="w-8 h-8 rounded bg-raised border border-border-control flex items-center justify-center text-xs font-bold">
                <span>&lt;</span>
              </span>
              <span className="hidden sm:inline">Matters</span>
            </button>
            <div className="flex items-center gap-2 text-xl font-bold text-primary tracking-tight">
              <span className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold text-lg">
                LM
              </span>
              <span>LM Legal</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <button className="btn btn-outline btn-sm">
              Save draft
            </button>
            <button className="btn btn-primary btn-sm elevate">
              Submit
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] mx-auto px-4 py-6 page-enter animate-fade-in">
        <div className="flex flex-col lg:flex-row gap-6">
          <nav className="w-full lg:w-80 flex-shrink-0">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded bg-raised border border-border-control flex items-center justify-center text-primary font-bold text-lg">
                M
              </div>
              <div>
                <h3 className="text-title">{id ? `Matter ${id.toUpperCase()}` : 'Matter'}</h3>
                <p className="text-caption-13 text-text-muted">Employment dispute - memo</p>
              </div>
            </div>

            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? 'bg-primary text-white shadow-shadow-md'
                      : 'text-text-secondary hover:bg-raised hover:text-text-deep'
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.key === 'questions' && (
                    <span className="w-5 h-5 rounded-full bg-error text-white text-[10px] flex items-center justify-center font-bold">2</span>
                  )}
                </button>
              ))}
            </div>

            {activeTab === 'documents' && (
              <div className="mt-8 card">
                <h4 className="text-body font-semibold mb-4">Documents</h4>
                <ul className="space-y-2">
                  {MATTER_DOCUMENTS.map((doc) => (
                    <li key={doc.id} className="flex items-center justify-between p-2 rounded border border-border-control hover:bg-sunken transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded bg-sunken flex items-center justify-center text-[10px] font-bold border border-border-control">
                          {doc.type.toUpperCase()}
                        </span>
                        <span className="text-body truncate">{doc.name}</span>
                      </div>
                      <span className="text-caption-13 text-text-muted">{doc.size}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="mt-8 card">
                <h4 className="text-body font-semibold mb-4">Your feedback</h4>
                <div className="space-y-4">
                  <div className="p-4 rounded bg-raised border border-border-control">
                    <div className="flex justify-between mb-2">
                      <span className="text-body font-semibold">Memo draft</span>
                      <span className="badge badge-published">Published</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-success text-white flex items-center justify-center text-xs font-bold">
                        72
                      </div>
                      <p className="text-body">Rubric based score. Written comments below.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </nav>

          <section className="flex-1 space-y-6">
            {activeTab === 'brief' && (
              <>
                <div className="card">
                  <h3 className="text-body font-semibold mb-4">Case brief</h3>
                  <div className="prose text-body max-w-none">
                    <p>
                      Your client is a small business owner who received a letter from a former employee claiming unfair dismissal. The employee worked for eighteen months and was dismissed without a disciplinary hearing. Your client says the employee was underperforming but admits no formal process was followed.
                    </p>
                    <p>
                      Prepare a memo of between two hundred and three hundred words that identifies the legal issues, explains the applicable law under the Labour Relations Act, and advises your client on the likely outcome if the matter proceeds to the CCMA.
                    </p>
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-body font-semibold mb-4">Your answer</h3>
                  <div className="relative">
                    <textarea
                      className="w-full min-h-[200px] px-4 py-3 text-body border border-border-control rounded-lg bg-sunken focus:outline-none focus:border-text-brass focus:ring-2 focus-ring resize-none"
                      placeholder="Type your memo here..."
                    ></textarea>
                    <div className="absolute bottom-2 right-2 text-caption-13 text-text-muted">
                      0 words
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="btn btn-secondary btn-lg elevate flex-1">
                    Save draft
                  </button>
                  <button
                    onClick={() => setShowSubmit(true)}
                    className="btn btn-primary btn-lg elevate flex-1"
                  >
                    Submit
                  </button>
                </div>
              </>
            )}

            {activeTab === 'questions' && (
              <>
                <h3 className="text-title mb-4">Questions</h3>
                <div className="space-y-4">
                  {MATTER_QUESTIONS.map((q) => (
                    <div key={q.id} className="card">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-caption-13 text-text-muted font-mono">{q.id.toUpperCase()}</span>
                          <h4 className="text-body font-semibold">{q.text}</h4>
                        </div>
                        <span className="text-caption-13 text-text-muted font-mono">{q.words}</span>
                      </div>
                      <textarea
                        className="w-full min-h-[120px] px-4 py-3 text-body border border-border-control rounded-lg bg-sunken focus:outline-none focus:border-text-brass focus:ring-2 focus-ring resize-none"
                        placeholder="Type your answer here..."
                      ></textarea>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-4">
                  <button className="btn btn-secondary btn-lg elevate flex-1">
                    Save all answers
                  </button>
                  <button
                    onClick={() => setShowSubmit(true)}
                    className="btn btn-primary btn-lg elevate flex-1"
                  >
                    Submit all answers
                  </button>
                </div>
              </>
            )}

            {activeTab === 'documents' && (
              <div>
                <h3 className="text-title mb-4">Case documents</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {MATTER_DOCUMENTS.map((doc) => (
                    <div key={doc.id} className="card cursor-pointer hover:border-primary transition-colors">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="w-8 h-8 rounded bg-raised border border-border-control flex items-center justify-center text-[10px] font-bold border">
                          {doc.type.toUpperCase()}
                        </span>
                        <span className="text-body font-semibold">{doc.name}</span>
                      </div>
                      <p className="text-caption-13 text-text-muted mb-4">{doc.size}</p>
                      <button className="btn btn-outline btn-sm w-full">
                        Open document
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'feedback' && (
              <div>
                <h3 className="text-title mb-4">Marker feedback</h3>
                <div className="space-y-4">
                  <div className="card">
                    <div className="flex justify-between mb-4">
                      <div>
                        <h4 className="text-body font-semibold">Memo draft</h4>
                        <p className="text-caption-13 text-text-muted">Submitted Fri 7 Jun 2024</p>
                      </div>
                      <span className="badge badge-published">Published</span>
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 rounded bg-success text-white flex items-center justify-center text-2xl font-bold">
                        72
                      </div>
                      <div className="flex-1">
                        <p className="text-body font-semibold">Rubric based score</p>
                        <p className="text-caption-13 text-text-muted">Scored against the marking rubric for this task.</p>
                      </div>
                    </div>
                    <div className="p-4 rounded bg-raised border border-border-control">
                      <p className="text-body mb-4">
                        Well structured memo with clear identification of the legal issues. Your application of the Labour Relations Act is sound. Consider addressing the procedural fairness requirements in more detail in future submissions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="border-t border-border-control bg-raised py-8 flex-shrink-0">
        <div className="max-w-[1400px] mx-auto px-4 text-center">
          <p className="text-caption-13 text-text-muted">LM Legal built for South African law graduates</p>
        </div>
      </footer>
    </div>
  );
}
