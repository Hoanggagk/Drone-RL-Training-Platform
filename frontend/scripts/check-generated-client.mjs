import { execFileSync } from 'node:child_process';
import { readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const output = join(tmpdir(), `mod01-openapi-${process.pid}.ts`);
try {
  execFileSync(
    process.execPath,
    [
      join('node_modules', 'openapi-typescript', 'bin', 'cli.js'),
      '../API_design/MOD-01_IDENTITY_ACCESS_MANAGEMENT/contracts/openapi.yaml',
      '-o',
      output,
    ],
    { stdio: 'inherit' },
  );
  if (readFileSync(output, 'utf8') !== readFileSync('src/generated/api-schema.ts', 'utf8')) {
    console.error('Generated client bị lệch OpenAPI. Chạy npm run api:generate.');
    process.exitCode = 1;
  } else console.log('Generated client đồng bộ OpenAPI.');
} finally {
  rmSync(output, { force: true });
}
