import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router';
import { Layout } from './ui/Layout.tsx';
import { AboutPage } from './ui/pages/AboutPage.tsx';
import { ExercisePage } from './ui/pages/ExercisePage.tsx';
import { HomePage } from './ui/pages/HomePage.tsx';
import { LibraryPage } from './ui/pages/LibraryPage.tsx';
import { NotFoundPage } from './ui/pages/NotFoundPage.tsx';
import './ui/styles.css';

// Hash routes, so deep links and refreshes work on GitHub Pages (ARCHITECTURE.md §9).
const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'library', element: <LibraryPage /> },
      { path: 'library/:id', element: <ExercisePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
