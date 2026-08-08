import { ValidatorFn } from '../middleware/validatorMiddleware';

// Regex for standard email format
const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;

// Regex for strong passwords: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const validateRegister: ValidatorFn = (body: any): string[] | null => {
  const errors: string[] = [];
  const { fullName, email, password, role } = body;

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 3) {
    errors.push('Full name is required and must be at least 3 characters long.');
  }

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    errors.push('A valid email address is required.');
  }

  if (!password || typeof password !== 'string' || !PASSWORD_REGEX.test(password)) {
    errors.push('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).');
  }

  if (!role || !['Patient', 'Doctor'].includes(role)) {
    errors.push('Role is required and must be either "Patient" or "Doctor". Public Admin registration is forbidden.');
  }

  return errors.length > 0 ? errors : null;
};

export const validateLogin: ValidatorFn = (body: any): string[] | null => {
  const errors: string[] = [];
  const { email, password } = body;

  if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email)) {
    errors.push('A valid email address is required.');
  }

  if (!password || typeof password !== 'string' || password.trim().length === 0) {
    errors.push('Password is required.');
  }

  return errors.length > 0 ? errors : null;
};
