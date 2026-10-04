import { Link, useParams } from 'react-router';
import { findExercise } from '../../content.ts';
import { formatCredit } from '../../domain/credit.ts';
import { Stimulus } from '../Stimulus.tsx';
import { NotFoundPage } from './NotFoundPage.tsx';

export function ExercisePage() {
  const exercise = findExercise(useParams().id ?? '');
  if (!exercise) return <NotFoundPage />;
  const credit = formatCredit(exercise.source);
  return (
    <>
      <p>
        <Link to="/library">← Library</Link>
      </p>
      <h1>{exercise.topics.join(', ') || exercise.id}</h1>
      {exercise.status === 'draft' && <p className="notice">Draft: not yet reviewed for publication.</p>}
      <Stimulus text={exercise.stimulus} />
      {credit && <p className="meta">Source: {credit}</p>}
      <h2>Tasks</h2>
      <ol>
        {exercise.tasks
          .filter((t) => t.status === 'active')
          .map((t) => (
            <li key={t.key}>{t.prompt}</li>
          ))}
      </ol>
    </>
  );
}
