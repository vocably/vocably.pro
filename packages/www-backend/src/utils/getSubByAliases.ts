import { Result } from '@vocably/model';
import { isEmail } from './isEmail';
import { isSub } from './isSub';
import { getSubByEmail } from './getSubByEmail';
import { isValidCognitoSub } from './isValidCognitoSub';

export const getSubByAliases = async (
  aliases: string[]
): Promise<Result<string>> => {
  for (const alias of aliases) {
    if (isEmail(alias)) {
      const result = await getSubByEmail(alias);
      if (result.success) {
        return result;
      }
    } else if (isSub(alias)) {
      const result = await isValidCognitoSub(alias);
      if (result.success && result.value) {
        return { success: true, value: alias };
      }
    }
  }

  return {
    success: false,
    reason: `Unable to find a valid Cognito user for aliases: ${aliases.join(', ')}`,
  };
};
