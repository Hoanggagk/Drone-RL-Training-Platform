/// <reference types="vite/client" />
declare const __DEMO_MODE__: boolean;
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_DEMO_MODE?: 'true' | 'false';
}
