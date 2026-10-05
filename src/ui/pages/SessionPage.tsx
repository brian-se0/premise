import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useBlocker, useNavigate, useParams } from 'react-router';
import { formatLocalDate } from '../../domain/dates.ts';
import { MAX_ANSWER_LENGTH } from '../../domain/prompt.ts';
import type { AttemptRecord, SessionRecord, SnapshotRecord } from '../../domain/records.ts';
import {
  AlreadySubmittedError,
  endSession,
  matchesDraftIdentity,
  openEntry,
  prepareGrading,
  saveDraft,
  skipAttempt,
  StaleError,
  submitAttempt,
  type DraftPrecondition,
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
  return <SessionBody key={id} id={id} />;
}

function SessionBody({ id }: { id: string }) {
  const settings = useSettings();
  const [continued, setContinued] = useState<string[]>([]);
  // Keep the displayed entry and its original session even if a replace-import removes the
  // session or changes its entry list. Otherwise the only copy of local text would unmount.
  const [pinned, setPinned] = useState<(Loaded & { index: number }) | null>(null);
  const data = useLive<Loaded | null>(async () => {
    const session = await db.sessions.get(id);
    if (!session) return null;
    const attempts = await db.attempts.bulkGet(session.entries.map((e) => e.attemptId ?? ''));
    return { session, attempts };
  }, [id]);

  if (data === undefined || !settings) return <p>Loading…</p>;
  if (pinned) {
    return (
      <EntryView
        key={`${pinned.session.id}-${pinned.index}`}
        session={pinned.session}
        index={pinned.index}
        attempts={pinned.attempts}
        liveSession={data?.session ?? null}
        liveAttempt={data?.attempts[pinned.index]}
        onDone={() => setPinned(null)}
      />
    );
  }
  if (data === null) return <NotFoundPage />;
  const { session, attempts } = data;
  const firstOpen = session.entries.findIndex((_, i) => !attempts[i] || attempts[i]!.state === 'draft');
  const editor = (index: number) => (
    <EntryView
      key={`${session.id}-${index}`}
      session={session}
      index={index}
      attempts={attempts}
      liveSession={session}
      liveAttempt={attempts[index]}
      onActive={() => setPinned({ session, attempts, index })}
      onDone={() => setPinned(null)}
    />
  );
  if (session.endedAt || firstOpen === -1) return <SessionDone session={session} attempts={attempts} />;

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
  liveSession,
  liveAttempt,
  onActive,
  onDone,
}: {
  session: SessionRecord;
  index: number;
  attempts: Loaded['attempts'];
  liveSession: SessionRecord | null;
  liveAttempt: AttemptRecord | undefined;
  onActive?: () => void;
  onDone: () => void;
}) {
  const navigate = useNavigate();
  const settings = useSettings();
  const [attempt, setAttempt] = useState<AttemptRecord | null>(null);
  const [snapshot, setSnapshot] = useState<SnapshotRecord | null>(null);
  const [answer, setAnswer] = useState('');
  const [saved, setSaved] = useState<'saved' | 'saving' | 'error' | 'idle'>('idle');
  const [error, setError] = useState('');
  const [blocked, setBlocked] = useState<{ message: string; otherSessionId?: string } | null>(null);
  // Set when another tab changed or submitted this answer: autosave stops and the text stays here.
  const [conflict, setConflict] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  // The draft revision this editor last read or wrote (saveDraft and submitAttempt check it).
  const revision = useRef(0);
  // Edit generations: "Saved" shows only when the latest edit is the one storage acknowledged.
  const edits = useRef({ latest: 0, saved: 0, text: '', savedText: '' });
  // Saves run one at a time, in order.
  const chain = useRef<Promise<void>>(Promise.resolve());
  const verification = useRef<Promise<void> | null>(null);
  const conflictRef = useRef(false);
  const liveMismatchRef = useRef(false);
  const flushRef = useRef<() => Promise<boolean>>(async () => false);
  const [navigationFailed, setNavigationFailed] = useState(false);
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    const differentPage =
      currentLocation.pathname !== nextLocation.pathname ||
      currentLocation.search !== nextLocation.search ||
      currentLocation.hash !== nextLocation.hash;
    return (
      differentPage &&
      (edits.current.latest !== edits.current.saved ||
        conflictRef.current ||
        !!verification.current ||
        liveMismatchRef.current)
    );
  });
  const blockerRef = useRef(blocker);
  useEffect(() => {
    blockerRef.current = blocker;
  }, [blocker]);
  const entry = session.entries[index]!;
  const live = liveAttempt;
  const precondition = useCallback(
    (a: AttemptRecord): DraftPrecondition => ({
      session,
      entryIndex: index,
      attempt: { ...a, revision: revision.current, answer: edits.current.savedText },
    }),
    [session, index],
  );
  liveMismatchRef.current =
    !!attempt &&
    !leaving &&
    !(
      matchesDraftIdentity(liveSession, live, precondition(attempt), true) &&
      live?.state === 'draft' &&
      live.revision === revision.current &&
      live.answer === edits.current.savedText
    );

  // A browser reload or close cannot wait for IndexedDB. Warn while text is unsaved or a
  // concurrent edit has made this local copy unsafe to discard.
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (
        edits.current.latest === edits.current.saved &&
        !conflictRef.current &&
        !verification.current &&
        !liveMismatchRef.current
      )
        return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        let a = attempts[index];
        if (!a) {
          const opened = await openEntry(db, ctx(), session.id, index, await currentSnapshot(entry.taskId));
          if (opened.status === 'draft-elsewhere') {
            if (!cancelled)
              setBlocked({
                message: 'This task has an unfinished answer in another session.',
                otherSessionId: opened.attempt.sessionId,
              });
            return;
          }
          if (opened.status === 'ineligible') {
            if (!cancelled)
              setBlocked({
                message:
                  opened.reason === 'suspended'
                    ? 'This task is hidden. Show it again in Settings to practise it.'
                    : opened.reason === 'awaiting-grade'
                      ? 'An earlier answer to this task is still waiting for its grade.'
                      : opened.reason === 'not-due' || opened.reason === 'not-before'
                        ? `This task is due on ${formatLocalDate(opened.notBefore!)}.`
                        : opened.reason === 'already-seen'
                          ? 'This task has already been seen, so this planned entry cannot be opened.'
                          : 'This task is not available today.',
              });
            return;
          }
          a = opened.attempt;
        }
        revision.current = a.revision;
        edits.current = { latest: 0, saved: 0, text: a.answer, savedText: a.answer };
        const snap = await db.snapshots.get(a.snapshotHash);
        if (cancelled) return;
        if (!snap) {
          setBlocked({ message: 'This task is no longer available in the saved content.' });
          return;
        }
        setAttempt(a);
        setSnapshot(snap);
        setAnswer(a.answer);
        onActive?.();
      } catch (e) {
        if (!cancelled) setBlocked({ message: e instanceof Error ? e.message : String(e) });
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

  // Another tab submitted or skipped this same answer while it was open here.
  const takenElsewhere =
    !!attempt &&
    !leaving &&
    matchesDraftIdentity(liveSession, live, precondition(attempt), true) &&
    live?.state !== 'draft';

  // A live query may briefly publish a snapshot from before this tab's own save. Check a
  // consistent read before declaring a backup rollback. Navigation can start this same check
  // if it arrives between the mismatch render and the effect below.
  const verifyDraft = useCallback(async () => {
    if (!attempt) return;
    try {
      // If a local write completes during the read, compare again with its new revision.
      for (;;) {
        const readRevision = revision.current;
        const savedText = edits.current.savedText;
        const current = await db.transaction('r', db.sessions, db.attempts, async () => ({
          session: await db.sessions.get(session.id),
          attempt: await db.attempts.get(attempt.id),
        }));
        if (conflictRef.current) return;
        if (readRevision !== revision.current || savedText !== edits.current.savedText) continue;

        const a = current.attempt;
        let message = '';
        if (!a || !matchesDraftIdentity(current.session, a, precondition(attempt), true))
          message =
            'This session was replaced in another tab. Your text is still here; copy it before leaving this page.';
        else if (a.state !== 'draft' || a.revision < revision.current)
          message = 'This answer changed in another tab. Your text is still here; copy it before leaving this page.';
        else if (a.answer !== edits.current.savedText && a.answer !== edits.current.text)
          message = 'This answer changed in another tab. Your text is still here; copy it before leaving this page.';

        if (message) {
          window.clearTimeout(timer.current);
          conflictRef.current = true;
          setConflict(true);
          setSaved('error');
          setError(message);
        } else if (a) {
          revision.current = a.revision;
          if (a.answer === edits.current.text) {
            edits.current.saved = edits.current.latest;
            edits.current.savedText = a.answer;
            setSaved('saved');
          } else {
            setSaved('saving');
          }
        }
        return;
      }
    } catch (e) {
      conflictRef.current = true;
      setConflict(true);
      setSaved('error');
      setError(
        `Could not check the saved answer: ${e instanceof Error ? e.message : String(e)}. Your text is still here; copy it before leaving this page.`,
      );
    }
  }, [attempt, precondition, session.id]);

  const beginVerification = useCallback(() => {
    if (verification.current) return verification.current;
    const check = verifyDraft();
    verification.current = check;
    void check.finally(() => {
      if (verification.current === check) verification.current = null;
    });
    return check;
  }, [verifyDraft]);

  useEffect(() => {
    if (!attempt || leaving || conflictRef.current || !liveMismatchRef.current) return;
    setSaved(edits.current.latest === edits.current.saved ? 'idle' : 'saving');
    void beginVerification();
  }, [attempt, live, liveSession, leaving, beginVerification]);

  const loadSavedDraft = async () => {
    if (!attempt) return;
    try {
      await chain.current;
      const current = await db.transaction('r', db.sessions, db.attempts, async () => ({
        session: await db.sessions.get(session.id),
        attempt: await db.attempts.get(attempt.id),
      }));
      if (!matchesDraftIdentity(current.session, current.attempt, precondition(attempt))) {
        setError(
          'This session was replaced in another tab. Your text is still here; copy it before leaving this page.',
        );
        return;
      }
      const savedAttempt = current.attempt!;
      if (savedAttempt.state !== 'draft') return;
      if (
        (answer !== savedAttempt.answer || conflictRef.current || edits.current.latest !== edits.current.saved) &&
        !window.confirm(
          'Replace the text on this page with the saved answer from storage? Copy your text first if you need it.',
        )
      )
        return;
      window.clearTimeout(timer.current);
      revision.current = savedAttempt.revision;
      edits.current = { latest: 0, saved: 0, text: savedAttempt.answer, savedText: savedAttempt.answer };
      setAnswer(savedAttempt.answer);
      conflictRef.current = false;
      setConflict(false);
      setError('');
      setSaved('saved');
    } catch (e) {
      fail(e);
    }
  };

  const fail = (e: unknown) => {
    if (e instanceof StaleError) {
      conflictRef.current = true;
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
    if (conflictRef.current) return Promise.resolve(false);
    const run = chain.current.then(async () => {
      if (liveMismatchRef.current && !verification.current) await beginVerification();
      while (verification.current) await verification.current;
      while (attempt && !conflictRef.current && edits.current.latest !== edits.current.saved) {
        const { latest, text } = edits.current;
        const r = await saveDraft(db, ctx(), precondition(attempt), text);
        revision.current = r.revision;
        edits.current.saved = latest;
        edits.current.savedText = text;
        if (edits.current.latest === latest) {
          setSaved('saved');
          setError('');
        }
      }
    });
    chain.current = run.catch(() => undefined);
    return run.then(
      () => !conflictRef.current && edits.current.latest === edits.current.saved,
      (e: unknown) => {
        fail(e);
        return false;
      },
    );
  };
  useEffect(() => {
    flushRef.current = flush;
  });

  // A phone browser may hide or discard the page without running beforeunload. Start the
  // checked save while the document is still alive, within the autosave delay.
  useEffect(() => {
    const saveWhenHidden = () => {
      if (document.visibilityState === 'hidden') void flushRef.current();
    };
    const saveOnPageHide = () => void flushRef.current();
    document.addEventListener('visibilitychange', saveWhenHidden);
    window.addEventListener('pagehide', saveOnPageHide);
    return () => {
      document.removeEventListener('visibilitychange', saveWhenHidden);
      window.removeEventListener('pagehide', saveOnPageHide);
    };
  }, []);

  // An in-app link waits for the same checked, serialized draft save as "Stop for now".
  // A failed save leaves the route and textarea in place until the student retries or explicitly
  // chooses to leave without this local text.
  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    let active = true;
    void flushRef.current().then((saved) => {
      if (!active) return;
      if (saved && blockerRef.current.state === 'blocked') blockerRef.current.proceed();
      else setNavigationFailed(true);
    });
    return () => {
      active = false;
    };
  }, [blocker.state]);

  const retryNavigation = async () => {
    setNavigationFailed(false);
    const saved = await flush();
    if (saved && blockerRef.current.state === 'blocked') blockerRef.current.proceed();
    else setNavigationFailed(true);
  };

  const navigationWarning = blocker.state === 'blocked' && (
    <div className="panel" role="alert">
      <p>
        {navigationFailed
          ? 'Your answer could not be saved before leaving. It is still on this page.'
          : 'Saving your answer before leaving…'}
      </p>
      <div className="row">
        {navigationFailed && !conflict && <button onClick={() => void retryNavigation()}>Try saving and leave</button>}
        <button
          onClick={() => {
            setNavigationFailed(false);
            blocker.reset();
          }}
        >
          Stay here
        </button>
        {navigationFailed && (
          <button className="danger" onClick={() => blocker.proceed()}>
            Leave without saving
          </button>
        )}
      </div>
    </div>
  );

  const onChange = (value: string) => {
    setAnswer(value);
    if (!attempt || conflictRef.current) return;
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
      await submitAttempt(db, ctx(), precondition(attempt), text, elapsed);
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
    if (!attempt || conflict) return;
    window.clearTimeout(timer.current);
    setLeaving(true);
    try {
      if (!(await flush())) throw new Error('Your latest text could not be saved, so the task was not skipped.');
      await skipAttempt(db, ctx(), precondition(attempt));
      onDone();
    } catch (e) {
      setLeaving(false);
      fail(e);
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
          This task was {live?.state === 'skipped' ? 'skipped' : 'submitted'} in another tab. The text below was not
          submitted from here.
        </p>
        <blockquote className="answer">{answer.trim() === '' ? '(blank)' : answer}</blockquote>
        {navigationWarning}
        <button
          onClick={() => {
            if (
              answer !== live?.answer &&
              !window.confirm('This local text is not the submitted answer. Copy it before continuing if you need it.')
            )
              return;
            onDone();
          }}
        >
          Continue without this copy
        </button>
      </>
    );
  }

  if (blocked) return <UnavailableEntry session={session} blocked={blocked} />;
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
      {navigationWarning}
      {conflict &&
        matchesDraftIdentity(liveSession, live, precondition(attempt)) &&
        live?.state === 'draft' &&
        live.revision >= revision.current && (
          <button onClick={() => void loadSavedDraft()}>Use the saved answer</button>
        )}
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
        <button disabled={conflict} onClick={() => void skip()}>
          Skip
        </button>
        <button className="link" disabled={conflict} onClick={() => void stop()}>
          Stop for now
        </button>
      </div>
      <p className="meta">
        Submitted answers can't be edited. Nothing is graded or revealed until you finish this argument.
      </p>
    </>
  );
}

function UnavailableEntry({
  session,
  blocked,
}: {
  session: SessionRecord;
  blocked: { message: string; otherSessionId?: string };
}) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <>
      <h1>Cannot open this task</h1>
      <p role="alert">{blocked.message}</p>
      {blocked.otherSessionId && (
        <p>
          <Link to={`/session/${blocked.otherSessionId}`}>Continue the unfinished answer</Link>
        </p>
      )}
      <button
        className="primary"
        disabled={busy}
        onClick={() => {
          setBusy(true);
          void endSession(db, ctx(), session.id).catch((e: unknown) => {
            setBusy(false);
            setError(e instanceof Error ? e.message : String(e));
          });
        }}
      >
        End session and grade
      </button>
      {error && <p role="alert">{error}</p>}
      <p>
        <Link to="/">Home</Link>
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

function SessionDone({ session, attempts }: { session: SessionRecord; attempts: (AttemptRecord | undefined)[] }) {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submitted = attempts.filter((a): a is AttemptRecord => !!a && a.state === 'submitted');
  const skipped = attempts.filter((a) => a?.state === 'skipped').length;
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
        {skipped > 0 ? `, ${skipped} skipped` : ''}.
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
