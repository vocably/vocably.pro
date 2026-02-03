import {
  analyze as apiAnalyze,
  deleteLanguageDeck as deleteLanguageDeckApi,
  fetchStudyStreak as apiFetchStudyStreak,
  getUserMetadata as apiGetUserMetadata,
  getUserStaticMetadata as apiGetUserStaticMetadata,
  listLanguages as listLanguagesApi,
  loadLanguageDeck as loadLanguageDeckApi,
  publicAnalyze,
  putStudyStreak as apiPutStudyStreak,
  saveLanguageDeck as saveLanguageDeckApi,
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

export const deleteLanguageDeck = async (
  ...params: Parameters<typeof deleteLanguageDeckApi>
): ReturnType<typeof deleteLanguageDeckApi> => {
  const isAnonymous = await isAnonymousUser();
  if (isAnonymous) {
    return {
      success: false,
      errorCode,
      reason,
    };
  }

  return deleteLanguageDeckApi(...params);
};

export const listLanguages = async (
  ...params: Parameters<typeof listLanguagesApi>
): ReturnType<typeof listLanguagesApi> => {
  const isAnonymous = await isAnonymousUser();
  if (isAnonymous) {
    return {
      success: false,
      errorCode,
      reason,
    };
  }

  return listLanguagesApi(...params);
};

export const loadLanguageDeck = async (
  ...params: Parameters<typeof loadLanguageDeckApi>
): ReturnType<typeof loadLanguageDeckApi> => {
  const isAnonymous = await isAnonymousUser();
  if (isAnonymous) {
    return {
      success: false,
      errorCode,
      reason,
    };
  }

  return loadLanguageDeckApi(...params);
};

export const saveLanguageDeck = async (
  ...params: Parameters<typeof saveLanguageDeckApi>
): ReturnType<typeof saveLanguageDeckApi> => {
  const isAnonymous = await isAnonymousUser();
  if (isAnonymous) {
    return {
      success: false,
      errorCode,
      reason,
    };
  }

  return saveLanguageDeckApi(...params);
};

export const analyze = async (
  ...params: Parameters<typeof apiAnalyze>
): ReturnType<typeof apiAnalyze> => {
  const isAnonymous = await isAnonymousUser();
  if (isAnonymous) {
    return publicAnalyze(...params);
  }

  return apiAnalyze(...params);
};
