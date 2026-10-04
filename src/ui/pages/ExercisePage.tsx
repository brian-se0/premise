import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { findExercise } from '../../content.ts';
import { studyableTasks } from '../../domain/availability.ts';
import { formatCredit } from '../../domain/credit.ts';
import { planExercise } from '../../domain/planner.ts';
import { beginSession } from '../actions.ts';
import { loadPlannerState } from '../runtime.ts';
import { Stimulus } from '../Stimulus.tsx';
import { NotFoundPage } from './NotFoundPage.tsx';

export function ExercisePage() {
  const navigate = useNavigate();
  const exercise = findExercise(useParams().id ?? '');
  const [message, setMessage] = useState('');
  if (!exercise) return <NotFoundPage />;
  const credit = formatCredit(exercise.source);
  const active = studyableTasks(exercise);

  const practice = async () => {
    const entries = planExercise(await loadPlannerState(), exercise.id);
    const id = await beginSession('library', entries);
    if (id) navigate(`/session/${id}`);
    else setMessage('These tasks are waiting for a grade, suspended, or were graded today. Try again tomorrow.');
  };

  return (
    <>
      <p>
        <Link to="/library">← Library</Link>
      </p>
      <h1>{exercise.topics.join(', ') || exercise.id}</h1>
      {exercise.status === 'draft' && <p className="notice">Draft: not yet reviewed for publication.</p>}
      {exercise.status === 'retired' && <p className="notice">Retired: kept for your history, no longer practised.</p>}
      <p className="meta">
        {active.length} {active.length === 1 ? 'task' : 'tasks'} · difficulty {exercise.difficulty} of 5. The argument
        appears when you start, so you meet it fresh.
      </p>
      {active.length > 0 && (
        <button className="primary" onClick={() => void practice()}>
          Practice this exercise
        </button>
      )}
      {message && <p role="status">{message}</p>}
      {credit && <p className="meta">Source: {credit}</p>}
      <details>
        <summary>Preview the argument anyway</summary>
        <Stimulus text={exercise.stimulus} />
      </details>
    </>
  );
}
