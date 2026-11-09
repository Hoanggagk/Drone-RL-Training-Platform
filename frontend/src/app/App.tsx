import { RouterProvider } from 'react-router-dom';
import { csrf } from '../lib/api/csrf';
import { onUnauthorized } from '../lib/api/client';
import { clearPrivateCache } from './query-client';
import { AppProviders } from './providers';
import { router } from './router';
onUnauthorized(() => {
  if (window.location.pathname === '/login') return;
  csrf.clear();
  void router
    .navigate('/login?reason=session-expired', { replace: true })
    .then(() => clearPrivateCache());
});
export function App() {
  return (
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
