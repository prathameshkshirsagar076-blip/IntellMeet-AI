export type SSOProvider = 'google' | 'microsoft' | 'saml';

export const SSO_PROVIDER_NAMES: Record<SSOProvider, string> = {
  google: 'Google Workspace',
  microsoft: 'Microsoft Azure AD / 365',
  saml: 'Single Sign-On (SAML 2.0)',
};
