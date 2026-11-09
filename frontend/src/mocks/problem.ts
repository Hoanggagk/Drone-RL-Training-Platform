import { HttpResponse } from 'msw';
export const mockProblem = (
  status: number,
  code: string,
  title: string,
  headers?: Record<string, string>,
) =>
  HttpResponse.json(
    { type: 'about:blank', title, status, code, correlation_id: 'demo-correlation-id' },
    { status, headers: { 'Content-Type': 'application/problem+json', ...headers } },
  );
