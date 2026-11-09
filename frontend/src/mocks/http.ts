import { http as mswHttp } from 'msw';

export const http = {
  get: ((path: string, resolver: Parameters<typeof mswHttp.get>[1]) =>
    mswHttp.get(`*${path}`, resolver)) as typeof mswHttp.get,
  post: ((path: string, resolver: Parameters<typeof mswHttp.post>[1]) =>
    mswHttp.post(`*${path}`, resolver)) as typeof mswHttp.post,
  put: ((path: string, resolver: Parameters<typeof mswHttp.put>[1]) =>
    mswHttp.put(`*${path}`, resolver)) as typeof mswHttp.put,
  patch: ((path: string, resolver: Parameters<typeof mswHttp.patch>[1]) =>
    mswHttp.patch(`*${path}`, resolver)) as typeof mswHttp.patch,
  delete: ((path: string, resolver: Parameters<typeof mswHttp.delete>[1]) =>
    mswHttp.delete(`*${path}`, resolver)) as typeof mswHttp.delete,
};
