// @ts-ignore
import { EMAIL_PASSWORD_AUTH_ENABLED } from '@env';

/**
 * Mirrors `email_password_auth_enabled` in platform/env-*.tfvars. Where it is
 * off the backend cannot send verification emails, so only Google and Apple
 * are offered.
 */
export const emailPasswordAuthEnabled = EMAIL_PASSWORD_AUTH_ENABLED === 'true';
