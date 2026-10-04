import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { MAX_ANSWER_LENGTH } from '../../domain/prompt.ts';
import type { AttemptRecord, SessionRecord, SnapshotRecord } from '../../domain/records.ts';
import {
  AlreadySubmittedError,
  endSession,
  openEntry,
  prepareGrading,
  saveDraft,
  skipAttempt,
  StaleError,
  submitAttempt,
} from '../../storage/ops.ts';
import { Stimulus } from '../Stimulus.tsx';
import { ctx, currentSnapshot, db, loadSettings, newOpId, useLive, useSettings } from '../runtime.ts';
import { NotFoundPage } from './NotFoundPage.tsx';

interface Loaded {
  session: SessionRecord;
  attempts: (AttemptRecord | undefined)[];
}

/** Freezes the answers into grading requests and opens the first one. */
async function startGrading(attemptIds: string[], mode: 'copy' | 'self', go: (to: string) => void): Promise<void> {
  const settings = await loadSettings();
  const { requestIds } = await prepareGrading(db, ctx(), newOpId(), attemptIds, settings.batchSize);
  go(`/request/${requestIds[0]}${mode === 'self' ? '?self=1' : ''}`);
}

function exerciseOf(taskId: string): string {
  return taskId.split('.')[0]!;
}

export function SessionPage() {
  const id = useParams().id ?? '';
  const settings = useSettings();
  const [continued, setContinued] = useState<string[]>([]);
  // The entry the student is typing in. It stays on screen even if another tab submits it, so
  // their local text is never unmounted without warning.
  const [pinned, setPinned] = useState<number | null>(null);
  const data = useLive<Loaded | null>(async () => {
    const session = await db.sessions.get(id);
    if (!session) return null;
    const attempts = await db.attempts.bulkGet(session.entries.map((e) => e.attemptId ?? ''));
    return { session, attempts };
  }, [id]);

  if (data === undefined || !settings) return <p>Loading…</p>;
  if (data === null) return <NotFoundPage />;
  const { session, attempts } = data;
  const firstOpen = session.entries.findIndex((_, i) => !attempts[i] || attempts[i]!.state === 'draft');
  const editor = (index: number) => (
    <EntryView
      key={`${session.id}-${index}`}
      session={session}
      index={index}
      attempts={attempts}
      onDirty={() => setPinned(index)}
      onDone={() => setPinned(null)}
    />
  );
  if (pinned !== null) return editor(pinned);
  if (firstOpen === -1) return <SessionDone session={session} attempts={attempts as AttemptRecord[]} />;

  // Per-exercise grading: offer to grade an argument's answers before moving to the next argument.
  if (settings.gradingMode === 'per-exercise' && firstOpen > 0) {
    const previous = exerciseOf(session.entries[firstOpen - 1]!.taskId);
    const ungraded = attempts.filter(
      (a): a is AttemptRecord =>
        !!a && exerciseOf(a.taskId) === previous && a.state === 'submitted' && a.requestId === null,
    );
    if (
      previous !== exerciseOf(session.entries[firstOpen]!.taskId) &&
      ungraded.length > 0 &&
      !continued.includes(previous)
    ) {
      return <GradeBreak attempts={ungraded} onContinue={() => setContinued([...continued, previous])} />;
    }
  }
  return editor(firstOpen);
}

function EntryView({
  session,
  index,
  attempts,
  onDirty,
  onDone,
}: {
  session: SessionRecord;
  index: number;
  attempts: Loaded['attempts'];
  onDirty: () => void;
  onDone: () => void;
}) {
  const navigate = useNavigate();
  const settings = useSettings();
  const [attempt, setAttempt] = useState<AttemptRecord | null>(null);
  const [snapshot, setSnapshot] = useState<SnapshotRecord | null>(null);
  const [answer, setAnswer] = useState('');
  const [saved, setSaved] = useState<'saved' | 'saving' | 'error' | 'idle'>('idle');
  const [error, setError] = useState('');
  // Set when another tab changed or submitted this answer: autosave stops and the text stays here.
  const [conflict, setConflict] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  // The draft revision this editor last read or wrote (saveDraft and submitAttempt check it).
  const revision = useRef(0);
  // Edit generations: "Saved" shows only when the latest edit is the one storage acknowledged.
  const edits = useRef({ latest: 0, saved: 0, text: '' });
  // Saves run one at a time, in order.
  const chain = useRef<Promise<void>>(Promise.resolve());
  const entry = session.entries[index]!;
  const live = attempts[index];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let a = attempts[index];
        if (!a) {
          const opened = await openEntry(db, ctx(), session.id, index, await currentSnapshot(entry.taskId));
          if (opened.status === 'draft-elsewhere')
            throw new Error('This task has an unfinished answer in another session. Finish it there first.');
          if (opened.status === 'ineligible')
            throw new Error(
              opened.reason === 'suspended'
                ? 'This task is hidden. Show it again in Settings to practise it.'
                : opened.reason === 'awaiting-grade'
                  ? 'An earlier answer to this task is still waiting for its grade.'
                  : 'This task comes back on a later day.',
            );
          a = opened.attempt;
        }
        revision.current = a.revision;
        edits.current = { latest: 0, saved: 0, text: a.answer };
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

  // Another tab submitted or skipped this answer while it was open here.
  const takenElsewhere = !!attempt && !leaving && !!live && live.state !== 'draft';

  const fail = (e: unknown) => {
    if (e instanceof StaleError) {
      setConflict(true);
      setError(
        'This answer was changed in another tab, so this copy is no longer saved. Copy your text before leaving this page.',
      );
    } else {
      setError(`Could not save: ${e instanceof Error ? e.message : String(e)}. Your text is still here.`);
    }
    setSaved('error');
  };

  /** Saves the latest text if storage doesn't have it yet. Resolves true when everything typed is saved. */
  const flush = (): Promise<boolean> => {
    window.clearTimeout(timer.current);
    const run = chain.current.then(async () => {
      if (!attempt || conflict) return;
      const { latest, text } = edits.current;
      if (latest === edits.current.saved) return;
      const r = await saveDraft(db, ctx(), attempt.id, revision.current, text);
      revision.current = r.revision;
      edits.current.saved = latest;
      if (edits.current.latest === latest) {
        setSaved('saved');
        setError('');
      }
    });
    chain.current = run.catch(() => undefined);
    return run.then(
      () => edits.current.latest === edits.current.saved,
      (e: unknown) => {
        fail(e);
        return false;
      },
    );
  };

  const onChange = (value: string) => {
    setAnswer(value);
    if (!attempt || conflict) return;
    onDirty();
    edits.current.latest += 1;
    edits.current.text = value;
    setSaved('saving');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => void flush(), 400);
  };

  const submit = async (text: string) => {
    if (!attempt) return;
    setLeaving(true);
    try {
      if (!(await flush())) throw new Error('Your latest text could not be saved, so nothing was submitted.');
      await submitAttempt(db, ctx(), attempt.id, revision.current, text, elapsed);
      onDone();
    } catch (e) {
      setLeaving(false);
      if (e instanceof AlreadySubmittedError || e instanceof StaleError) fail(e);
      else setError(e instanceof Error ? e.message : String(e));
      // Keep autosaving whatever is still unsaved.
      if (edits.current.latest !== edits.current.saved) timer.current = window.setTimeout(() => void flush(), 400);
    }
  };

  const skip = async () => {
    if (!attempt) return;
    window.clearTimeout(timer.current);
    setLeaving(true);
    try {
      await skipAttempt(db, ctx(), attempt.id);
      onDone();
    } catch (e) {
      setLeaving(false);
      setError(`Could not skip: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  const stop = async () => {
    // Leave only once the text is safely stored; otherwise stay with the text on screen.
    if (await flush()) navigate('/');
  };

  if (takenElsewhere) {
    return (
      <>
        <p role="alert">
          This task was {live.state === 'skipped' ? 'skipped' : 'submitted'} in another tab. The text below was not
          submitted from here.
        </p>
        <blockquote className="answer">{answer.trim() === '' ? '(blank)' : answer}</blockquote>
        <button onClick={onDone}>Continue</button>
      </>
    );
  }

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
        readOnly={conflict}
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
        <button
          className="primary"
          disabled={conflict || tooLong || answer.trim() === ''}
          onClick={() => void submit(answer)}
        >
          Submit
        </button>
        <button
          disabled={conflict}
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

function GradeBreak({ attempts, onContinue }: { attempts: AttemptRecord[]; onContinue: () => void }) {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const grade = (mode: 'copy' | 'self') =>
    startGrading(
      attempts.map((a) => a.id),
      mode,
      (to) => void navigate(to),
    ).catch((e: unknown) => setError(e instanceof Error ? e.message : String(e)));
  return (
    <>
      <h1>Grade this argument?</h1>
      <p>
        You answered {attempts.length} {attempts.length === 1 ? 'task' : 'tasks'} on this argument. Grade now, or keep
        going and grade at the end.
      </p>
      <div className="row">
        <button className="primary" onClick={() => void grade('copy')}>
          Grade with a chatbot
        </button>
        <button onClick={() => void grade('self')}>Grade it myself</button>
        <button onClick={onContinue}>Continue the session</button>
      </div>
      {error && <p role="alert">{error}</p>}
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
      await startGrading(
        unowned.map((a) => a.id),
        mode,
        (to) => void navigate(to),
      );
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
