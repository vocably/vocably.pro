import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { Result } from '@vocably/model';

const client = new CognitoIdentityProviderClient();

export const getSubByEmail = async (email: string): Promise<Result<string>> => {
  const userPoolId = process.env.USER_POOL_ID;

  try {
    const command = new ListUsersCommand({
      UserPoolId: userPoolId,
      Filter: `email = "${email}"`,
      Limit: 1,
    });

    const response = await client.send(command);

    if (response.Users.length === 0) {
      return {
        success: false,
        reason: `Unable to find the user with email '${email}' in the user pool.`,
      };
    }

    const sub = response.Users[0].Attributes.find(
      (attr) => attr.Name === 'sub'
    )?.Value;

    if (!sub) {
      return {
        success: false,
        reason: `The sub of the user with email '${email}' does not exist.`,
      };
    }

    return {
      success: true,
      value: sub,
    };
  } catch (err) {
    return {
      success: false,
      reason: `Exception while getting the sub of '${email}'`,
      extra: err,
    };
  }
};
