import { defineConfig, devices } from '@playwright/test';
const externalServer = process.env.PW_EXTERNAL_SERVER === 'true';
export default defineConfig({
  testDir: './tests/e2e',
  workers: 1,
  ...(externalServer
    ? {}
    : {
        webServer: {
          command: 'node ./scripts/start-demo-server.mjs',
          url: 'http://127.0.0.1:5173',
          reuseExistingServer: true,
        },
      }),
  use: { baseURL: 'http://127.0.0.1:5173', viewport: { width: 1024, height: 768 } },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1024, height: 768 } },
    },
  ],
});
