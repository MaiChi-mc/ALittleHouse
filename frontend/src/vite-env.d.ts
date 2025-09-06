/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // thêm biến khác nếu có, ví dụ:
  // readonly VITE_GOOGLE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
