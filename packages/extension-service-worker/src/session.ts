import { fetchAuthSession } from 'aws-amplify/auth';

/**
 * Amplify v6 resolves `fetchAuthSession()` with an empty session when the user
 * is signed out, rather than rejecting the way v4's `currentSession()` did, so
 * the tokens have to be checked explicitly.
 */
export const isSignedIn = async (): Promise<boolean> => {
  const session = await fetchAuthSession().catch(() => null);

  return !!session?.tokens?.accessToken;
};

export const isInPaidGroup = async (): Promise<boolean> => {
  const session = await fetchAuthSession().catch(() => null);
  const groups = session?.tokens?.accessToken?.payload['cognito:groups'];

  return Array.isArray(groups) && groups.includes('paid');
};

export const getIdToken = async (): Promise<string> => {
  const session = await fetchAuthSession().catch(() => null);

  return session?.tokens?.idToken?.toString() ?? '';
};
