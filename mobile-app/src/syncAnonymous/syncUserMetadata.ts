import { getUserMetadata, saveUserMetadata } from '@vocably/api';
import { Result, UserMetadata } from '@vocably/model';

export const syncUserMetadata = async (
  fromMetadata: UserMetadata
): Promise<Result<UserMetadata>> => {
  const currentMetadataResult = await getUserMetadata();
  if (currentMetadataResult.success === false) {
    return currentMetadataResult;
  }

  const newMetadata: UserMetadata = {
    ...currentMetadataResult.value,
    ...fromMetadata,
  };

  return saveUserMetadata(newMetadata);
};
