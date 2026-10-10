/**
 * Centralized, typed application environment configuration.
 * Provides safe fallbacks and parsed types for all VITE_ environment variables.
 */

export const env = {
  // Application
  appName: import.meta.env.VITE_APP_NAME || 'IntellMeet AI',
  appEnv: (import.meta.env.VITE_APP_ENV || 'development') as 'development' | 'staging' | 'production',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,

  // API & WebSockets
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV
      ? '/api/v1'
      : 'https://eikpbdtfv5.execute-api.eu-west-3.amazonaws.com/api/v1'),
  remoteApiBaseUrl:
    import.meta.env.VITE_REMOTE_API_BASE_URL ||
    'https://eikpbdtfv5.execute-api.eu-west-3.amazonaws.com/api/v1',
  apiTimeoutMs: Number(import.meta.env.VITE_API_TIMEOUT_MS) || 15000,
  wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:5000/ws',

  // Authentication & SSO Client IDs (Public client credentials)
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  microsoftClientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
  samlEntityId: import.meta.env.VITE_SAML_ENTITY_ID || '',

  // Feature Flags
  enableMockAuth: import.meta.env.VITE_ENABLE_MOCK_AUTH !== 'false',
  enableAiTranscription: import.meta.env.VITE_ENABLE_AI_TRANSCRIPTION !== 'false',

  // Contact & Legal
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'support@intellmeet-ai.internal',
  legalEmail: import.meta.env.VITE_LEGAL_EMAIL || 'legal@intellmeet-ai.internal',
  privacyEmail: import.meta.env.VITE_PRIVACY_EMAIL || 'privacy@intellmeet-ai.internal',
} as const;

export default env;
