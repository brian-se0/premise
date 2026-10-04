import { Link } from 'react-router';
import { content } from '../../content.ts';

export function HomePage() {
  const count = content.exercises.length;
  return (
    <>
      <h1>Premise</h1>
      <p className="lead">
        Read a short argument, write your analysis in your own words, and have it graded by any AI chatbot you already
        use, or grade it yourself against the rubric.
      </p>
      <p>
        Practice sessions arrive in the next milestone. For now you can browse the <Link to="/library">library</Link> (
        {count} {count === 1 ? 'exercise' : 'exercises'}).
      </p>
    </>
  );
}
