import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { MAX_ANSWER_LENGTH } from '../../domain/prompt.ts';
import type { AttemptRecord, SessionRecord, SnapshotRecord } from '../../domain/records.ts';
import { endSession, openEntry, prepareGrading, saveDraft, skipAttempt, submitAttempt } from '../../storage/ops.ts';
import { Stimulus } from '../Stimulus.tsx';
import { ctx, currentSnapshot, db, loadSettings, newOpId, useLive, useSettings } from '../runtime.ts';
import { NotFoundPage } from './NotFoundPage.tsx';

interface Loaded {
  session: SessionRecord;
  attempts: (AttemptRecord | undefined)[];
}

export function SessionPage() {
  const id = useParams().id ?? '';
  const data = useLive<Loaded | null>(async () => {
    const session = await db.sessions.get(id);
    if (!session) return null;
    const attempts = await db.attempts.bulkGet(session.entries.map((e) => e.attemptId ?? ''));
    return { session, attempts };
  }, [id]);

  if (data === undefined) return <p>Loading…</p>;
  if (data === null) return <NotFoundPage />;
  const { session, attempts } = data;
  const firstOpen = session.entries.findIndex((_, i) => !attempts[i] || attempts[i]!.state === 'draft');
  if (firstOpen === -1) return <SessionDone session={session} attempts={attempts as AttemptRecord[]} />;
  return <EntryView key={`${session.id}-${firstOpen}`} session={session} index={firstOpen} attempts={attempts} />;
}

function EntryView({
  session,
  index,
  attempts,
}: {
  session: SessionRecord;
  index: number;
  attempts: Loaded['attempts'];
}) {
  const navigate = useNavigate();
  const settings = useSettings();
  const [attempt, setAttempt] = useState<AttemptRecord | null>(null);
  const [snapshot, setSnapshot] = useState<SnapshotRecord | null>(null);
  const [answer, setAnswer] = useState('');
  const [saved, setSaved] = useState<'saved' | 'saving' | 'error' | 'idle'>('idle');
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const entry = session.entries[index]!;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const existing = attempts[index];
        const a = existing ?? (await openEntry(db, ctx(), session.id, index, await currentSnapshot(entry.taskId)));
        const snap = await db.snapshots.get(a.snapshotHash);
        if (cancelled) return;
        setAttempt(a);
        setSnapshot(snap ?? null);
        setAnswer(a.answer);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
    // The attempt is created once per entry.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id, index]);

  useEffect(() => {
    if (!attempt) return;
    const started = new Date(attempt.startedAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - started) / 1000));
    tick();
    const t = window.setInterval(tick, 1000);
    return () => window.clearInterval(t);
  }, [attempt]);

  const onChange = (value: string) => {
    setAnswer(value);
    if (!attempt) return;
    setSaved('saving');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      saveDraft(db, ctx(), attempt.id, value)
        .then(() => setSaved('saved'))
        .catch((e: unknown) => {
          setSaved('error');
          setError(`Could not save: ${e instanceof Error ? e.message : String(e)}. Your text is still here.`);
        });
    }, 400);
  };

  const submit = async (text: string) => {
    if (!attempt) return;
    window.clearTimeout(timer.current);
    setLeaving(true);
    try {
      await submitAttempt(db, ctx(), attempt.id, text, elapsed);
    } catch (e) {
      setLeaving(false);
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const skip = async () => {
    if (!attempt) return;
    window.clearTimeout(timer.current);
    setLeaving(true);
    await skipAttempt(db, ctx(), attempt.id);
  };

  const stop = async () => {
    window.clearTimeout(timer.current);
    if (attempt) await saveDraft(db, ctx(), attempt.id, answer).catch(() => undefined);
    navigate('/');
  };

  if (error && !attempt) return <p role="alert">{error}</p>;
  if (!attempt || !snapshot || !settings || leaving) return <p>Loading…</p>;

  const total = session.entries.length;
  const previous = index > 0 ? session.entries[index - 1] : undefined;
  const sameStimulus = previous?.taskId.split('.')[0] === entry.taskId.split('.')[0];
  const timed = settings.finalWeeks && settings.timerEnabled;
  const over = elapsed > settings.timerSeconds;
  const tooLong = answer.length > MAX_ANSWER_LENGTH;

  return (
    <>
      <p className="meta">
        Task {index + 1} of {total}
        {attempt.kind === 'review' ? ' · review' : attempt.kind === 'coached' ? ' · try again' : ''}
        {attempt.stimulusSeenBefore ? ' · familiar argument' : ''}
      </p>
      {sameStimulus && <p className="meta">Same argument as the previous task.</p>}
      <Stimulus text={snapshot.stimulus} />
      {snapshot.credit && <p className="meta">Source: {snapshot.credit}</p>}
      <h1 className="task-prompt">{snapshot.prompt}</h1>
      {timed && (
        <p className={over ? 'timer over' : 'timer'} aria-live="off">
          {fmt(elapsed)} / {fmt(settings.timerSeconds)}
          {over ? ' · over time (keep going; it is recorded separately)' : ''}
        </p>
      )}
      <label htmlFor="answer" className="sr-only">
        Your answer
      </label>
      <textarea
        id="answer"
        rows={6}
        value={answer}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your answer in your own words."
        aria-describedby="answer-status"
      />
      <p id="answer-status" className="meta" aria-live="polite">
        {saved === 'saving' ? 'Saving…' : saved === 'saved' ? 'Saved' : saved === 'error' ? 'Not saved' : ''}
        {answer.length > MAX_ANSWER_LENGTH * 0.8 && ` · ${answer.length} / ${MAX_ANSWER_LENGTH} characters`}
      </p>
      {error && <p role="alert">{error}</p>}
      <div className="row">
        <button className="primary" disabled={tooLong || answer.trim() === ''} onClick={() => void submit(answer)}>
          Submit
        </button>
        <button
          onClick={() => {
            if (window.confirm('Submit a blank answer? It will be graded as 0 and scheduled for review.'))
              void submit('');
          }}
        >
          Submit blank
        </button>
        <button onClick={() => void skip()}>Skip</button>
        <button className="link" onClick={() => void stop()}>
          Stop for now
        </button>
      </div>
      <p className="meta">
        Submitted answers can't be edited. Nothing is graded or revealed until you finish this argument.
      </p>
    </>
  );
}

function fmt(s: number): string {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function SessionDone({ session, attempts }: { session: SessionRecord; attempts: AttemptRecord[] }) {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submitted = attempts.filter((a) => a.state === 'submitted');
  const unowned = submitted.filter((a) => a.requestId === null);
  const requestIds = [...new Set(submitted.map((a) => a.requestId).filter((x): x is string => x !== null))];

  useEffect(() => {
    if (!session.endedAt) void endSession(db, ctx(), session.id);
  }, [session]);

  const grade = async (mode: 'copy' | 'self') => {
    setBusy(true);
    try {
      const settings = await loadSettings();
      const { requestIds: ids } = await prepareGrading(
        db,
        ctx(),
        newOpId(),
        unowned.map((a) => a.id),
        settings.batchSize,
      );
      navigate(`/request/${ids[0]}${mode === 'self' ? '?self=1' : ''}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  };

  return (
    <>
      <h1>Session done</h1>
      <p>
        {submitted.length} {submitted.length === 1 ? 'answer' : 'answers'} submitted
        {attempts.length > submitted.length ? `, ${attempts.length - submitted.length} skipped` : ''}.
      </p>
      {unowned.length > 0 ? (
        <>
          <p>Grade them now with a chatbot, or against the rubric yourself.</p>
          <div className="row">
            <button className="primary" disabled={busy} onClick={() => void grade('copy')}>
              Grade with a chatbot
            </button>
            <button disabled={busy} onClick={() => void grade('self')}>
              Grade it myself
            </button>
          </div>
        </>
      ) : null}
      {requestIds.length > 0 && (
        <>
          <h2>Grading requests</h2>
          <ul className="list">
            {requestIds.map((r) => (
              <li key={r}>
                <Link to={`/request/${r}`}>Open request</Link>
              </li>
            ))}
          </ul>
        </>
      )}
      {error && <p role="alert">{error}</p>}
      <p>
        <Link to="/">Home</Link>
      </p>
    </>
  );
}
