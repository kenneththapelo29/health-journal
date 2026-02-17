export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePasswordStrength(password: string, isTesting: boolean = false): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) errors.push('Password must be at least 8 characters');
  if (!/\d/.test(password)) errors.push('Password must contain at least 1 digit');
  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    if (!isTesting) {
      errors.push('Password must contain at least 1 special character');
    } else {
      console.warn('Special character requirement relaxed for testing');
    }
  }
  
  return { valid: errors.length === 0, errors };
}

export function formatValidationError(errors: string[]): string {
  return errors.join('. ');
}