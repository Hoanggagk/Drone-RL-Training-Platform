import { QueryClient } from '@tanstack/react-query';
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, error) =>
        !(
          typeof error === 'object' &&
          error &&
          'status' in error &&
          (error as { status: number }).status === 401
        ) && count < 1,
    },
    mutations: { retry: false },
  },
});
export function clearPrivateCache() {
  void queryClient.cancelQueries();
  queryClient.removeQueries();
  return Promise.resolve();
}
