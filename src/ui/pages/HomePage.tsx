import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { content } from '../../content.ts';
import { dueTaskIds, planNewOnly, planToday } from '../../domain/planner.ts';
import { awaitingRequests, beginSession, recentRequests, unfinishedSessions, ungradedSessions } from '../actions.ts';
import { db, loadPlannerState, loadSettings, useLive, useSettings } from '../runtime.ts';

export function HomePage() {
  const navigate = useNavigate();
  const settings = useSettings();
  const plan = useLive(async () => {
    const state = await loadPlannerState();
    return { today: planToday(state), due: dueTaskIds(state).length, state };
  }, []);
  const awaiting = useLive(awaitingRequests, []);
  const unfinished = useLive(unfinishedSessions, []);
  const ungraded = useLive(ungradedSessions, []);
  const recent = useLive(() => recentRequests(), []);
  const [skill, setSkill] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [message, setMessage] = useState('');

  const start = async (mode: 'today' | 'new') => {
    if (!plan) return;
    const entries =
      mode === 'today'
        ? plan.today
        : planNewOnly(plan.state, { skill: skill || null, difficulty: difficulty ? Number(difficulty) : null });
    const id = await beginSession(mode, entries);
    if (id) navigate(`/session/${id}`);
    else setMessage('Nothing matches right now. Try another filter, or come back tomorrow.');
  };

  const exportDue = useLive(async () => {
    const [count, s] = await Promise.all([db.gradings.count(), loadSettings()]);
    if (count === 0) return false;
    return s.lastExportAt === null || Date.now() - new Date(s.lastExportAt).getTime() > 7 * 24 * 3600 * 1000;
  }, []);

  const hasContent = content.exercises.length > 0;

  return (
    <>
      <h1>{hasContent ? 'Today' : 'Premise'}</h1>
      {!hasContent && <p>No exercises are published yet. Check back soon.</p>}
      {settings?.persistGranted === false && (
        <p className="notice">
          This browser may clear Premise's data when space runs low. Export a backup now and then.
        </p>
      )}
      {exportDue && (
        <p className="notice">
          {settings?.lastExportAt
            ? 'Your last backup is over a week old.'
            : 'You have graded answers but no backup yet.'}{' '}
          <Link to="/settings#backup">Export a backup</Link>
        </p>
      )}

      {unfinished && unfinished.length > 0 && (
        <section aria-labelledby="resume">
          <h2 id="resume">Pick up where you left off</h2>
          <ul className="list">
            {unfinished.map(({ session, remaining }) => (
              <li key={session.id}>
                <Link to={`/session/${session.id}`}>
                  Session from {new Date(session.createdAt).toLocaleString()}: {remaining} left
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {ungraded && ungraded.length > 0 && (
        <section aria-labelledby="ungraded">
          <h2 id="ungraded">Submitted, not yet graded</h2>
          <ul className="list">
            {ungraded.map(({ session, attempts }) => (
              <li key={session.id}>
                <Link to={`/session/${session.id}`}>
                  Session from {new Date(session.createdAt).toLocaleString()}: {attempts.length}{' '}
                  {attempts.length === 1 ? 'answer' : 'answers'} to grade
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {awaiting && awaiting.length > 0 && (
        <section aria-labelledby="awaiting">
          <h2 id="awaiting">Awaiting grading</h2>
          <ul className="list">
            {awaiting.map((r) => (
              <li key={r.id}>
                <Link to={`/request/${r.id}`}>
                  Request {r.label}: {r.pending} waiting
                  {r.needsReview > 0 ? `, ${r.needsReview} need review` : ''}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {hasContent && (
        <>
          <section aria-labelledby="practice">
            <h2 id="practice">Practice</h2>
            <p>
              {plan ? (
                <>
                  {plan.due} {plan.due === 1 ? 'review is' : 'reviews are'} due.{' '}
                  {plan.today.length > 0
                    ? `Today's session has ${plan.today.length} ${plan.today.length === 1 ? 'task' : 'tasks'}.`
                    : 'Nothing is ready for today.'}
                  {settings?.finalWeeks ? ' Final-weeks mode is on.' : ''}
                </>
              ) : (
                'Loading…'
              )}
            </p>
            <button className="primary" disabled={!plan || plan.today.length === 0} onClick={() => void start('today')}>
              Start today's session
            </button>
            {settings?.focus.tag && (
              <p className="meta">
                Focus: {content.taxonomy.error_tags[settings.focus.tag] ?? settings.focus.tag} (
                <Link to="/settings#focus">change</Link>)
              </p>
            )}
          </section>

          <section aria-labelledby="new-only">
            <h2 id="new-only">New tasks only</h2>
            <div className="row">
              <label>
                Skill{' '}
                <select value={skill} onChange={(e) => setSkill(e.target.value)}>
                  <option value="">Any</option>
                  {Object.entries(content.taxonomy.skills)
                    .filter(([id]) => content.exercises.some((e) => e.tasks.some((t) => t.skill === id)))
                    .map(([id, s]) => (
                      <option key={id} value={id}>
                        {s.label}
                      </option>
                    ))}
                </select>
              </label>
              <label>
                Difficulty{' '}
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="">Any</option>
                  {[1, 2, 3, 4, 5].map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button onClick={() => void start('new')} disabled={!plan}>
              Start new tasks
            </button>
            {message && <p role="status">{message}</p>}
          </section>
        </>
      )}

      {recent && recent.length > 0 && (
        <section aria-labelledby="results">
          <h2 id="results">Recent results</h2>
          <ul className="list">
            {recent.map((r) => (
              <li key={r.id}>
                <Link to={`/request/${r.id}`}>
                  Request {r.label} from {new Date(r.createdAt).toLocaleDateString()}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
