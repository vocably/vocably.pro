import {
  getUserMetadata as apiGetUserMetadata,
  saveUserMetadata as apiSaveUserMetadata,
} from '@vocably/api';
import { PartialUserMetadata, Result, UserMetadata } from '@vocably/model';

let userMetadata: UserMetadata | null = null;

export const getUserMetadata = async (): Promise<Result<UserMetadata>> => {
  if (userMetadata !== null) {
    return {
      success: true,
      value: userMetadata,
    };
  }

  const result = await apiGetUserMetadata();

  if (result.success === false) {
    return result;
  }

  userMetadata = result.value;

  return {
    success: true,
    value: result.value,
  };
};

export const invalidateUserMetadata = (): void => {
  userMetadata = null;
};

/**
 * Sends only the changed fields: the API merges them into the freshly loaded
 * metadata, so a stale cached copy never overwrites values saved elsewhere
 * (e.g. the mobile app's rate responses).
 */
export const saveUserMetadata = async (
  payloadMetadata: PartialUserMetadata
): Promise<Result<UserMetadata>> => {
  const result = await apiSaveUserMetadata(payloadMetadata);

  userMetadata = result.success ? result.value : null;

  return result;
};
