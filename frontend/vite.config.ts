import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), ['VITE_API_BASE_URL', 'VITE_DEMO_MODE']);
  return {
    plugins: [react()],
    define: { __DEMO_MODE__: JSON.stringify(env.VITE_DEMO_MODE === 'true') },
  };
});
