import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <>
      <h1>Not found</h1>
      <p>
        There is nothing at this address. <Link to="/">Go home</Link>.
      </p>
    </>
  );
}
