import { signInWithRedirect } from 'aws-amplify/auth';
import { forcefulSignOut } from '../forcefulSignOut';
import { i18n } from '../i18n';

export const signIn = async () => {
  const language = i18n.language;

  try {
    await signInWithRedirect({
      options: {
        prompt: 'LOGIN',
        lang: { es: 'es', pt: 'pt-BR' }[language] ?? 'en',
      },
    });
  } catch (e) {
    // @ts-ignore
    if (e.toString().includes('UserAlreadyAuthenticatedException')) {
      forcefulSignOut();
    }
  }
};
