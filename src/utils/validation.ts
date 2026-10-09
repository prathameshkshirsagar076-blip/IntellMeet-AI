/**
 * Form validation utilities for IntellMeet authentication flows.
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email.trim());
};

export const validateEmail = (email: string): string | undefined => {
  if (!email.trim()) {
    return 'Work email is required.';
  }
  if (!isValidEmail(email)) {
    return 'Please enter a valid work email address.';
  }
  return undefined;
};

export const validatePassword = (
  password: string,
  options: { minLength?: number; requireAlphaNum?: boolean } = { minLength: 6 }
): string | undefined => {
  const { minLength = 6, requireAlphaNum = false } = options;

  if (!password) {
    return 'Password is required.';
  }
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters.`;
  }
  if (requireAlphaNum && (!/[A-Za-z]/.test(password) || !/\d/.test(password))) {
    return 'Password must include at least one letter and one number.';
  }
  return undefined;
};

export const validateFullName = (name: string): string | undefined => {
  const trimmed = name.trim();
  if (!trimmed) {
    return 'Full name is required.';
  }
  if (trimmed.length < 2) {
    return 'Full name must be at least 2 characters.';
  }
  return undefined;
};
