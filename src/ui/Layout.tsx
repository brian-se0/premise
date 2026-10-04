import { useRef } from 'react';
import { NavLink, Outlet } from 'react-router';

export function Layout() {
  const main = useRef<HTMLElement>(null);
  return (
    <>
      {/* The router owns the URL fragment, so the skip link moves focus instead of navigating. */}
      <a
        className="skip"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
          main.current?.scrollIntoView();
        }}
      >
        Skip to content
      </a>
      <header className="bar">
        <NavLink to="/" className="brand" end>
          Premise
        </NavLink>
        <nav aria-label="Main">
          <NavLink to="/" end>
            Home
          </NavLink>
          <NavLink to="/library">Library</NavLink>
          <NavLink to="/settings">Settings</NavLink>
          <NavLink to="/about">About</NavLink>
        </nav>
      </header>
      <main id="main" tabIndex={-1} ref={main}>
        <Outlet />
      </main>
    </>
  );
}
