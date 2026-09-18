import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  UserType,
} from '@aws-sdk/client-cognito-identity-provider';

const client = new CognitoIdentityProviderClient();

/**
 * Cognito only enforces uniqueness on the username. This pool has no
 * `username_attributes` or `alias_attributes` (both immutable after creation),
 * so an email is only unique because callers use it as the username - which
 * federated users, whose username is `Google_<sub>`, never do.
 */
export const listUsersByEmail = async ({
  userPoolId,
  email,
}: {
  userPoolId: string;
  email: string;
}): Promise<UserType[]> => {
  const response = await client.send(
    new ListUsersCommand({
      UserPoolId: userPoolId,
      Filter: `email = "${email}"`,
      Limit: 10,
    })
  );

  return response.Users ?? [];
};
