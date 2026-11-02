import { useState } from 'react';
import { NavLink } from 'react-router-dom';

const TASK_TYPES = [
  { id: 'essay', label: 'Essay question', description: 'Open text response with word count' },
  { id: 'memo', label: 'Memo', description: 'Legal memo format response' },
  { id: 'mcq', label: 'Multiple choice', description: 'Single correct answer' },
  { id: 'problem', label: 'Problem question', description: 'Fact pattern with legal analysis' },
];

export function TaskBuilder() {
  const [step, setStep] = useState(1);
  const [taskType, setTaskType] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPrompt, setTaskPrompt] = useState('');
  const [rubricItems, setRubricItems] = useState<{ criterion: string; maxScore: string }[]>([{ criterion: '', maxScore: '' }]);
  const [modelAnswer, setModelAnswer] = useState('');

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-text-deep">
      <header className="bg-raised border-b border-border-control flex-shrink-0">
        <div className="max-w-[1400px] mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 text-text-secondary hover:text-primary">
              <span className="w-8 h-8 rounded bg-raised border border-border-control flex items-center justify-center text-xs font-bold">
                <span>&lt;</span>
              </span>
              <span className="hidden sm:inline">Admin overview</span>
            </button>
            <div className="flex items-center gap-2 text-xl font-bold text-primary tracking-tight">
              <span className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold text-lg">
                LM
              </span>
              <span>LM Legal</span>
            </div>
          </div>
          <div className="text-sm text-text-secondary">
            Task builder
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] mx-auto px-4 py-6 page-enter animate-fade-in">
        <h2 className="text-title mb-8">Task builder</h2>

        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= s ? 'bg-primary text-white' : 'bg-sunken border border-border-control text-text-secondary'
              }`}>
                {s}
              </div>
              {s < 4 && <div className="w-6 h-px bg-border-control"></div>}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-body font-semibold mb-4">Task type</h3>
              <p className="text-body mb-4">
                Choose what kind of task students will complete.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {TASK_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTaskType(t.id)}
                    className={`p-4 rounded border text-left transition-colors cursor-pointer ${
                      taskType === t.id
                        ? 'bg-primary text-white border-primary'
                        : 'bg-raised border-border-control text-text-deep hover:bg-sunken'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-8 h-8 rounded bg-raised border border-border-control flex items-center justify-center text-[10px] font-bold">
                        {t.id.toUpperCase()}
                      </span>
                      <span className="text-body font-semibold">{t.label}</span>
                    </div>
                    <p className="text-caption-13 text-text-secondary">{t.description}</p>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={nextStep} className="btn btn-primary btn-lg elevate">
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-body font-semibold mb-4">Task details</h3>
              <form className="space-y-4">
                <div>
                  <label className="label" htmlFor="task-title">Task title</label>
                  <input
                    type="text"
                    id="task-title"
                    className="input"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g. Employment dispute memo"
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="task-prompt">Task prompt</label>
                  <textarea
                    id="task-prompt"
                    className="input min-h-[200px]"
                    value={taskPrompt}
                    onChange={(e) => setTaskPrompt(e.target.value)}
                    placeholder="Describe what the student should do..."
                    required
                  ></textarea>
                </div>
              </form>
            </div>
            <div className="flex justify-between">
              <button onClick={prevStep} className="btn btn-secondary btn-lg">
                Back
              </button>
              <button onClick={nextStep} className="btn btn-primary btn-lg elevate" disabled={!taskTitle || !taskPrompt}>
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-body font-semibold mb-4">Marking rubric</h3>
              <p className="text-body mb-4">
                Define the criteria and maximum marks for each.
              </p>
              <div className="space-y-3">
                {rubricItems.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <input
                      type="text"
                      className="input flex-1"
                      placeholder="Criterion name"
                      value={item.criterion}
                      onChange={(e) => {
                        const next = [...rubricItems];
                        next[i].criterion = e.target.value;
                        setRubricItems(next);
                      }}
                    />
                    <input
                      type="number"
                      className="input w-20"
                      placeholder="Max"
                      value={item.maxScore}
                      onChange={(e) => {
                        const next = [...rubricItems];
                        next[i].maxScore = e.target.value;
                        setRubricItems(next);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setRubricItems(rubricItems.filter((_, j) => j !== i))}
                      className="w-8 h-8 rounded bg-error text-white flex items-center justify-center text-xs font-bold"
                    >
                      <span>&times;</span>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setRubricItems([...rubricItems, { criterion: '', maxScore: '' }])}
                  className="text-xs text-primary hover:text-primary font-medium underline underline-offset-2"
                >
                  Add criterion
                </button>
              </div>
            </div>
            <div className="flex justify-between">
              <button onClick={prevStep} className="btn btn-secondary btn-lg">
                Back
              </button>
              <button onClick={nextStep} className="btn btn-primary btn-lg elevate">
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-body font-semibold mb-4">Model answer</h3>
              <p className="text-body mb-4">
                Provide the model answer for marker reference and calibration.
              </p>
              <textarea
                id="model-answer"
                className="input min-h-[300px]"
                value={modelAnswer}
                onChange={(e) => setModelAnswer(e.target.value)}
                placeholder="Enter the model answer or key points markers should look for..."
              ></textarea>
            </div>
            <div className="flex justify-between">
              <button onClick={prevStep} className="btn btn-secondary btn-lg">
                Back
              </button>
              <button className="btn btn-primary btn-lg elevate">
                Create task
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-border-control bg-raised py-8 flex-shrink-0">
        <div className="max-w-[1400px] mx-auto px-4 text-center">
          <p className="text-caption-13 text-text-muted">LM Legal built for South African law graduates</p>
        </div>
      </footer>
    </div>
  );
}
