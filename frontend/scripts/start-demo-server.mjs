import { createServer } from 'vite';

const server = await createServer({ mode: 'demo', server: { host: '127.0.0.1', port: 5173 } });
await server.listen();
server.printUrls();

async function shutdown() {
  await server.close();
  process.exit(0);
}
process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);
