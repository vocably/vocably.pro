import {
  fetchStudyStreak as apiFetchStudyStreak,
  getUserMetadata as apiGetUserMetadata,
  getUserStaticMetadata as apiGetUserStaticMetadata,
  putStudyStreak as apiPutStudyStreak,
  saveUserMetadata as apiSaveUserMetadata,
} from '@vocably/api';
import { isAnonymousUser } from './getStorageId';

const errorCode = 'ANONYMOUS';
const reason = 'The user is anonymous.';

export const fetchStudyStreak = async (): ReturnType<
  typeof apiFetchStudyStreak
> => {
  const isAnonymous = await isAnonymousUser();
  if (isAnonymous) {
    return {
      success: false,
      errorCode,
      reason,
    };
  }

  return apiFetchStudyStreak();
};

export const getUserMetadata = async (): ReturnType<
  typeof apiGetUserMetadata
> => {
  const isAnonymous = await isAnonymousUser();
  if (isAnonymous) {
    return {
      success: false,
      errorCode,
      reason,
    };
  }

  return apiGetUserMetadata();
};

export const getUserStaticMetadata = async (): ReturnType<
  typeof apiGetUserStaticMetadata
> => {
  const isAnonymous = await isAnonymousUser();
  if (isAnonymous) {
    return {
      success: false,
      errorCode,
      reason,
    };
  }

  return apiGetUserStaticMetadata();
};

export const putStudyStreak = async (
  ...params: Parameters<typeof apiPutStudyStreak>
): ReturnType<typeof apiPutStudyStreak> => {
  const isAnonymous = await isAnonymousUser();
  if (isAnonymous) {
    return {
      success: false,
      errorCode,
      reason,
    };
  }

  return apiPutStudyStreak(...params);
};

export const saveUserMetadata = async (
  ...params: Parameters<typeof apiSaveUserMetadata>
): ReturnType<typeof apiSaveUserMetadata> => {
  const isAnonymous = await isAnonymousUser();
  if (isAnonymous) {
    return {
      success: false,
      errorCode,
      reason,
    };
  }

  return apiSaveUserMetadata(...params);
};
