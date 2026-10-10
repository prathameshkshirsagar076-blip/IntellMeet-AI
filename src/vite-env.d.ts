/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_ENV: 'development' | 'staging' | 'production';
  readonly VITE_APP_VERSION: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_REMOTE_API_BASE_URL?: string;
  readonly VITE_API_TIMEOUT_MS: string;
  readonly VITE_WS_URL: string;
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_MICROSOFT_CLIENT_ID: string;
  readonly VITE_SAML_ENTITY_ID: string;
  readonly VITE_ENABLE_MOCK_AUTH: string;
  readonly VITE_ENABLE_AI_TRANSCRIPTION: string;
  readonly VITE_SUPPORT_EMAIL: string;
  readonly VITE_LEGAL_EMAIL: string;
  readonly VITE_PRIVACY_EMAIL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
