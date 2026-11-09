import { spawn } from 'node:child_process';
import { join } from 'node:path';

const server = spawn(process.execPath, [join('scripts', 'start-demo-server.mjs')], {
  stdio: 'inherit',
  env: process.env,
});

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch('http://127.0.0.1:5173/login');
      if (response.ok) return;
    } catch {
      /* server is still starting */
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('Demo server did not become ready.');
}

let exitCode = 1;
try {
  await waitForServer();
  exitCode = await new Promise((resolve) => {
    const tests = spawn(
      process.execPath,
      [join('node_modules', '@playwright', 'test', 'cli.js'), 'test'],
      {
        stdio: 'inherit',
        env: { ...process.env, PW_EXTERNAL_SERVER: 'true' },
      },
    );
    tests.once('exit', (code) => resolve(code ?? 1));
  });
} finally {
  server.kill('SIGTERM');
  server.unref();
}
process.exit(exitCode);
