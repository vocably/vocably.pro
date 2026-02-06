import { signInWithRedirect } from 'aws-amplify/auth';
import { forcefulSignOut } from '../forcefulSignOut';

export const signIn = async () => {
  try {
    await signInWithRedirect();
  } catch (e) {
    // @ts-ignore
    if (e.toString().includes('UserAlreadyAuthenticatedException')) {
      forcefulSignOut();
    }
  }
};

export const signInWithAnIdioticCognitoFlow = async () => {
  await signInWithRedirect({
    provider: 'Google',
    options: {
      preferPrivateSession: true,
    },
  });
};
