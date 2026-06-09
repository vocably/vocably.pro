import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { Result } from '@vocably/model';

const client = new CognitoIdentityProviderClient();

export const isValidCognitoSub = async (
  sub: string
): Promise<Result<boolean>> => {
  const userPoolId = process.env.USER_POOL_ID;

  try {
    const command = new ListUsersCommand({
      UserPoolId: userPoolId,
      Filter: `sub = "${sub}"`,
      Limit: 1,
    });

    const response = await client.send(command);

    return {
      success: true,
      value: response.Users.length > 0,
    };
  } catch (err) {
    return {
      success: false,
      reason: `Exception while validating sub '${sub}'`,
      extra: err,
    };
  }
};
