import { Result } from '@vocably/model';
import { loadAuthStatusFromStorage } from './auth/AuthContainer';

export const getStorageId = async (): Promise<Result<string>> => {
  const authStatus = await loadAuthStatusFromStorage();

  if (authStatus.status === 'anonymous-logged-in') {
    return {
      success: true,
      value: 'anonymous',
    };
  }

  if (authStatus.status === 'logged-in') {
    return {
      success: true,
      value: authStatus.sub,
    };
  }

  return {
    success: false,
    reason: 'Unable to get current user sub',
  };
};
