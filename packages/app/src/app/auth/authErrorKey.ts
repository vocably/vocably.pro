import { AuthErrorCode } from '@vocably/sulna';

/**
 * `invalidCredentials` -> `auth.errors.invalid_credentials`
 */
export const authErrorKey = (code: AuthErrorCode): string =>
  `auth.errors.${code.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`)}`;
