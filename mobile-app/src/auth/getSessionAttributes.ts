import { fetchAuthSession } from 'aws-amplify/auth';
import { Result } from '@vocably/model';

type AuthSession = Awaited<ReturnType<typeof fetchAuthSession>>;

// Derives the user's sub/email from a session we already hold, instead of
// calling `fetchUserAttributes()` (Cognito GetUser), which performs its own
// token fetch/refresh outside the single-flight `safeFetchAuthSession` gate
// and can race concurrent refreshes. The ID token payload already carries
// these claims, so no extra token access is needed.
export const getSessionAttributes = (
  session: AuthSession
): Result<{ sub: string; email: string }> => {
  const payload = session.tokens?.idToken?.payload;
  const sub = session.userSub ?? payload?.sub;
  const email = payload?.email;

  if (typeof sub !== 'string' || typeof email !== 'string') {
    return {
      success: false,
      reason: 'The session has no sufficient attributes',
      extra: payload,
    };
  }

  return {
    success: true,
    value: { sub, email },
  };
};
