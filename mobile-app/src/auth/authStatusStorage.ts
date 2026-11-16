import * as asyncAppStorage from '../asyncAppStorage';

export type AuthStatus =
  | {
      status: 'undefined';
    }
  | {
      status: 'not-logged-in';
    }
  | {
      status: 'anonymous-logged-in';
      id: string;
    }
  | {
      status: 'logged-in';
      sub: string;
      email: string;
      isPaidGroup: boolean;
    };

const authStatusStorageKey = 'vocablyAuthStatus';

export const loadAuthStatusFromStorage = async (): Promise<AuthStatus> => {
  const status = await asyncAppStorage.getItem(authStatusStorageKey);

  if (!status) {
    return {
      status: 'undefined',
    };
  }

  return JSON.parse(status);
};

export const saveAuthStatusToStorage = async (status: AuthStatus) => {
  await asyncAppStorage.setItem(authStatusStorageKey, JSON.stringify(status));
};
