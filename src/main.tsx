import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router';
import { Layout } from './ui/Layout.tsx';
import { AboutPage } from './ui/pages/AboutPage.tsx';
import { ExercisePage } from './ui/pages/ExercisePage.tsx';
import { HomePage } from './ui/pages/HomePage.tsx';
import { LibraryPage } from './ui/pages/LibraryPage.tsx';
import { NotFoundPage } from './ui/pages/NotFoundPage.tsx';
import { RequestPage } from './ui/pages/RequestPage.tsx';
import { SessionPage } from './ui/pages/SessionPage.tsx';
import { SettingsPage } from './ui/pages/SettingsPage.tsx';
import { requestPersistence } from './ui/runtime.ts';
import './ui/styles.css';

// Hash routes, so deep links and refreshes work on GitHub Pages (ARCHITECTURE.md §9).
const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'library', element: <LibraryPage /> },
      { path: 'library/:id', element: <ExercisePage /> },
      { path: 'session/:id', element: <SessionPage /> },
      { path: 'request/:id', element: <RequestPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

void requestPersistence().catch(() => undefined);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
