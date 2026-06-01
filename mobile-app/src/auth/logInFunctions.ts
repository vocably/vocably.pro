import { signInWithRedirect } from 'aws-amplify/auth';
import { forcefulSignOut } from '../forcefulSignOut';

export const signIn = async () => {
  try {
    await signInWithRedirect({
      options: {
        prompt: 'LOGIN',
      },
    });
  } catch (e) {
    // @ts-ignore
    if (e.toString().includes('UserAlreadyAuthenticatedException')) {
      forcefulSignOut();
    }
  }
};
