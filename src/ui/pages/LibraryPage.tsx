import { Link } from 'react-router';
import { content } from '../../content.ts';

export function LibraryPage() {
  const { exercises, taxonomy } = content;
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
                  {e.tasks
                    .filter((t) => t.status === 'active')
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
