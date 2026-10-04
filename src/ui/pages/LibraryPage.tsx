import { Link } from 'react-router';
import { content } from '../../content.ts';
import { isStudyable, studyableTasks } from '../../domain/availability.ts';

export function LibraryPage() {
  const { taxonomy } = content;
  const exercises = content.exercises.filter(isStudyable);
  return (
    <>
      <h1>Library</h1>
      {exercises.length === 0 ? (
        <p>No exercises are published yet.</p>
      ) : (
        <ul className="cards">
          {exercises.map((e) => (
            <li key={e.id}>
              <Link to={`/library/${e.id}`}>
                <span className="card-title">{e.topics.join(', ') || e.id}</span>
                <span className="meta">
                  {studyableTasks(e)
                    .map((t) => taxonomy.skills[t.skill]?.label ?? t.skill)
                    .join(' · ')}
                </span>
                <span className="meta">
                  Difficulty {e.difficulty} of 5{e.status === 'draft' ? ' · draft' : ''}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
