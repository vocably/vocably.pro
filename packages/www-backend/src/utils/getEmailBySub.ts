import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { Result } from '@vocably/model';

const client = new CognitoIdentityProviderClient();

export const getEmailBySub = async (sub: string): Promise<Result<string>> => {
  const userPoolId = process.env.USER_POOL_ID;

  try {
    const command = new ListUsersCommand({
      UserPoolId: userPoolId,
      Filter: `sub = "${sub}"`,
      Limit: 1,
    });

    const response = await client.send(command);

    if (response.Users.length === 0) {
      return {
        success: false,
        reason: `Unable to find the user with sub '${sub}' in the user pool.`,
      };
    }

    const email = response.Users[0].Attributes.find(
      (attr) => attr.Name === 'email'
    )?.Value;

    if (!email) {
      return {
        success: false,
        reason: `The email of the user with sub '${sub}' does not exist.`,
      };
    }

    return {
      success: true,
      value: email,
    };
  } catch (err) {
    return {
      success: false,
      reason: `Exception while getting the email of '${sub}'`,
      extra: err,
    };
  }
};
