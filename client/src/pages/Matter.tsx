import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

const STAGE_ORDER = ['brief', 'documents', 'questions', 'decision', 'draft', 'submit'];

export function Matter() {
  const [data, setData] = useState<any>(null);
  const [stage, setStage] = useState<'brief' | 'documents' | 'questions' | 'decision' | 'draft' | 'submit'>('brief');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [decision, setDecision] = useState<string | null>(null);
  const [memo, setMemo] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [openDocId, setOpenDocId] = useState<string | null>(null);
  const [openDoc, setOpenDoc] = useState<any>(null);

  useEffect(() => {
    fetch('/api/matter')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setWordCount(memo.trim().split(/\s+/).filter(Boolean).length);
  }, [memo]);

  const stageIndex = STAGE_ORDER.indexOf(stage);
  const doneKeys = data?.state?.stages_done || [];

  const inRange = wordCount >= 300 && wordCount <= 500;

  const nextStage = () => {
    if (stageIndex < STAGE_ORDER.length - 1) {
      setStage(STAGE_ORDER[stageIndex + 1] as any);
    }
  };

  const questions = data?.questions || [];
  const documents = data?.documents || [];
  const decisionObj = data?.decision || null;
  const decisionOptions = decisionObj
    ? [
        { id: 'condonation', title: 'Apply for condonation', desc: decisionObj.consequence_condonation || '' },
        { id: 'poor_prospects', title: 'Advise poor prospects', desc: decisionObj.consequence_poor_prospects || '' },
      ]
    : [];

  const handleSubmit = async () => {
    if (!inRange) {
      alert('Memo must be 300 to 500 words before submitting.');
      return;
    }
    const res = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memo, decision, csrf_token: '' }),
    });
    if (res.ok) {
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto page-enter animate-fade-in">
      <div className="card">
        <div className="mb-6">
          <h1 className="card-title">Legal simulation</h1>
          <p className="card-subtitle">
            Unfair dismissal CCMA matter work through each stage.
          </p>
        </div>

        <div className="mb-6">
          <div className="flex gap-2">
            {STAGE_ORDER.map((s, i) => (
              <div
                key={s}
                className="h-1.5 flex-1 rounded-full"
                style={{
                  backgroundColor:
                    doneKeys.includes(s) || i <= stageIndex
                      ? '#14263f'
                      : '#d4c7a8',
                }}
              />
            ))}
          </div>
        </div>

        {stage === 'brief' && <BriefStage data={data} onDone={nextStage} />}
        {stage === 'documents' && (
          <DocumentsStage
            documents={documents}
            openDoc={setOpenDoc}
            openDocId={openDocId}
            setOpenDocId={setOpenDocId}
            onDone={nextStage}
          />
        )}
        {stage === 'questions' && (
          <QuestionsStage
            questions={questions}
            answers={answers}
            onAnswer={(q: number, a: number) =>
              setAnswers({ ...answers, ['q' + q]: a })
            }
          />
        )}
        {stage === 'decision' && (
          <DecisionStage
            options={decisionOptions}
            decision={decision}
            onDecision={(d: string) => {
              setDecision(d);
              nextStage();
            }}
          />
        )}
        {stage === 'draft' && (
          <DraftStage
            memo={memo}
            onChange={setMemo}
            wordCount={wordCount}
            inRange={inRange}
          />
        )}
        {stage === 'submit' && (
          <SubmissionStage
            decision={decision}
            memo={memo}
            wordCount={wordCount}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}

function BriefStage({ data, onDone }: any) {
  const [read, setRead] = useState(false);

  const markDone = async () => {
    await fetch('/api/matter/stage-done', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: 'brief' }),
    });
    setRead(true);
    onDone();
  };

  return (
    <div className="page-enter animate-fade-in">
      <h2 className="card-title">Stage 1 Read the brief</h2>
      <p className="card-subtitle mb-4">
        Read the client email before answering questions.
      </p>
      <div className="card mb-6 bg-beige-surface">
        <div className="doc-card">
          <div className="doc-icon">E</div>
          <div>
            <div className="doc-title">Client email unfair dismissal</div>
            <div className="doc-meta">From Sarah Chen at Bright Retail Pty Ltd</div>
          </div>
        </div>
        <p className="mt-4">
          Dear Legal Team, We recently terminated the employment of Marcus Bell, a store
          manager, following a restructuring process. Mr Bell believes the dismissal was
          unfair and has lodged a claim with the CCMA. We need your advice on whether the
          dismissal was procedurally fair and what exposure we face. Please review the
          documents below and provide your assessment. Regards, Sarah Chen, HR Manager
        </p>
      </div>
      <button
        className="btn btn-primary mt-4 elevate"
        disabled={read}
        onClick={markDone}
      >
        {read ? 'Brief marked read' : 'Mark brief read'}
      </button>
    </div>
  );
}

function DocumentsStage({
  documents,
  openDoc,
  openDocId,
  setOpenDocId,
  onDone,
}: any) {
  const hasDocuments = documents && documents.length > 0;

  return (
    <div className="page-enter animate-fade-in">
      <h2 className="card-title">Stage 2 Review the documents</h2>
      <p className="card-subtitle mb-4">
        Open each document to read its contents.
      </p>
      {hasDocuments ? (
        <>
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {documents.map((doc: any) => (
              <div
                key={doc.id}
                className="doc-card cursor-pointer elevate card-lift p-4"
                onClick={() => {
                  openDoc(doc);
                  setOpenDocId(doc.id);
                }}
              >
                <div className="doc-icon">D</div>
                <div>
                  <div className="doc-title">{doc.title}</div>
                  <div className="doc-meta">Document {doc.id}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="card mb-6 bg-beige-surface p-6 text-center">
          <div className="doc-icon text-4xl mb-3">D</div>
          <p className="text-text-surface mb-4">No documents available for this task.</p>
          <button
            className="btn btn-primary elevate"
            onClick={onDone}
          >
            Continue to next stage
          </button>
        </div>
      )}
      {openDocId && (
        <div className="card mt-4">
          <h3 className="card-title mb-2" style={{ fontSize: '16px' }}>
            Document content
          </h3>
          <div className="mb-4 p-4 rounded bg-beige-surface border border-beige-border">
            {openDoc.content || ''}
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setOpenDocId(null)}
          >
            Close document
          </button>
        </div>
      )}
    </div>
  );
}

function QuestionsStage({
  questions,
  answers,
  onAnswer,
}: any) {
  return (
    <div className="page-enter animate-fade-in">
      <h2 className="card-title">Stage 3 Answer the questions</h2>
      <p className="card-subtitle mb-4">
        Select one answer for each question.
      </p>
      <div className="mb-4">
        {questions.map((q: any, i: number) => (
          <div key={i} className="question-block mb-3">
            <div className="question-text">Q{i + 1}. {q.text}</div>
            <div>
              {q.options.map((opt: string, j: number) => (
                <label key={j} className="choice-row block mb-2">
                  <input
                    type="radio"
                    name={`q${i + 1}`}
                    checked={answers[`q${i + 1}`] === j}
                    onChange={() => onAnswer(i + 1, j)}
                    className="mr-2 mt-0.5"
                  />
                  <span className="choice-label">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DecisionStage({ options, decision, onDecision }: any) {
  return (
    <div className="page-enter animate-fade-in">
      <h2 className="card-title">Stage 4 Decision point</h2>
      <p className="card-subtitle mb-4">
        Choose how to proceed. Your choice changes the follow-up email the client receives.
      </p>
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map((opt: any) => (
          <div
            key={opt.id}
            className={`decision-card cursor-pointer p-4 rounded-lg border ${decision === opt.id ? 'border-navy bg-gold-soft' : 'border-beige-border bg-beige-surface hover:bg-beige-soft elevate card-lift'}`}
            onClick={() => onDecision(opt.id)}
          >
            <div className="decision-title font-bold">{opt.title}</div>
            <div className="decision-desc text-sm text-text-muted mt-1">
              {opt.desc}
            </div>
          </div>
        ))}
      </div>
      {decision && (
        <div className="mt-4 text-center">
          <span className="badge badge-navy">Decision recorded</span>
        </div>
      )}
    </div>
  );
}

function DraftStage({ memo, onChange, wordCount, inRange }: any) {
  return (
    <div className="page-enter animate-fade-in">
      <h2 className="card-title">Stage 5 Draft your memo</h2>
      <p className="card-subtitle mb-4">
        Write a legal memo of 300 to 500 words. Drafts autosave as you type.
      </p>
      <textarea
        value={memo}
        onChange={(e) => onChange(e.target.value)}
        className="input w-full h-64 elevate card-lift"
        placeholder="Start drafting your memo here…"
      />
      <div className="flex justify-between mt-2 text-xs text-text-muted">
        <span>{wordCount} words</span>
        <span className={inRange ? 'text-green-600' : 'text-red-600'}>
          {inRange ? 'Within range' : 'Outside 300 to 500 words'}
        </span>
      </div>
    </div>
  );
}

function SubmissionStage({ decision, memo, wordCount, onSubmit }: any) {
  return (
    <div className="page-enter animate-fade-in">
      <h2 className="card-title">Stage 6 Submit</h2>
      <p className="card-subtitle mb-4">
        Review and submit your memo for marking.
      </p>
      <div className="mb-4">
        <div className="mb-2">
          <span className="text-text-muted">Decision</span>
          <span className="badge badge-beige">{decision}</span>
        </div>
        <div className="mb-2">
          <span className="text-text-muted">Word count</span>
          <span>{wordCount} words</span>
        </div>
        <div className="mb-4 p-4 rounded bg-beige-surface border border-beige-border">
          {memo || '(no memo drafted)'}
        </div>
      </div>
      <button
        className="btn btn-primary btn-full w-full mt-4 elevate"
        onClick={onSubmit}
      >
        Submit for marking
      </button>
    </div>
  );
}
