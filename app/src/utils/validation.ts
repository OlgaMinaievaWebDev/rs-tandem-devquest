export type ValidationResult = {
  isValid: boolean;
  error: string;
};

export function validateUsername(username: string): ValidationResult {
  if (!username.trim()) {
    return { isValid: false, error: 'Username is required' };
  }
  if (username.length < 3) {
    return { isValid: false, error: 'Must be at least 3 characters' };
  }
  const regex = /^[a-zA-Z0-9]+$/;
  if (!regex.test(username)) {
    return { isValid: false, error: 'Latin letters and numbers only' };
  }
  return { isValid: true, error: '' };
}

export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  if (password.length < 6) {
    return { isValid: false, error: 'Must be at least 6 characters' };
  }
  if (/[^\x20-\x7E]/.test(password)) {
    return {
      isValid: false,
      error: 'Please use only Latin letters, numbers, and standard symbols',
    };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { isValid: false, error: 'Must contain at least one letter' };
  }

  if (!/\d/.test(password)) {
    return { isValid: false, error: 'Must contain at least one number' };
  }
  return { isValid: true, error: '' };
}

export function validateEmail(email: string): ValidationResult {
  if (!email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  return { isValid: true, error: '' };
}
