#!/usr/bin/env zx
/**
 * Drives the email + password flows against a deployed environment.
 *
 * There is no client UI for these yet, so this is how the pre sign-up and
 * custom message triggers get exercised end to end.
 *
 * Reads USER_POOL_ID / USER_POOL_CLIENT_ID / AWS_REGION from scripts/.env.local
 * (written by platform/environments.tf). The app client has no secret, so no
 * SECRET_HASH is needed.
 *
 * Sign-in itself is not covered here: the app client only allows SRP, which
 * this script would have to reimplement. Verify it through managed login or
 * the app instead.
 *
 * While the AWS account is still in the SES sandbox, Cognito can only deliver
 * to addresses verified in SES - verify the address you pass first, or nothing
 * will arrive.
 *
 *   npx zx ./scripts/test-email-auth.mjs --email you@example.com
 *   npx zx ./scripts/test-email-auth.mjs --email you@example.com --locale ru
 *   npx zx ./scripts/test-email-auth.mjs --email you@example.com --only collisions
 */
import {
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  ResendConfirmationCodeCommand,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import 'zx/globals';
import { scriptsDir } from './helpers/dirs.mjs';

const env = Object.fromEntries(
  fs
    .readFileSync(`${scriptsDir}/.env.local`, 'utf8')
    .split('\n')
    .filter((line) => line.includes('='))
    .map((line) => {
      const [key, ...rest] = line.split('=');
      return [key.trim(), rest.join('=').trim().replace(/^"|"$/g, '')];
    })
);

const region = env.AWS_REGION;
const clientId = env.USER_POOL_CLIENT_ID;

if (!clientId) {
  throw new Error(
    'USER_POOL_CLIENT_ID is missing from scripts/.env.local. Run terraform apply first.'
  );
}

const email = (argv.email ?? '').trim().toLowerCase();
const locale = argv.locale ?? 'en';
const only = argv.only ?? 'all';

if (!email) {
  throw new Error('Pass --email you@example.com');
}

const client = new CognitoIdentityProviderClient({ region });

// The username *is* the lowercased email. That is what makes the address
// unique: this pool has no username_attributes or alias_attributes, and both
// are immutable after creation.
const username = email;

const password = `Aa1!${Math.random().toString(36).slice(2, 10)}`;
const newPassword = `Bb2@${Math.random().toString(36).slice(2, 10)}`;

const expectFailure = async (label, fn, expected) => {
  try {
    await fn();
    console.log(chalk.red(`FAIL ${label}: expected a rejection, got success`));
  } catch (error) {
    console.log(
      error.message.includes(expected)
        ? chalk.green(`ok   ${label}`)
        : chalk.red(
            `FAIL ${label}: expected "${expected}", got "${error.message}"`
          )
    );
  }
};

const signUp = () =>
  client.send(
    new SignUpCommand({
      ClientId: clientId,
      Username: username,
      Password: password,
      UserAttributes: [{ Name: 'email', Value: email }],
      ClientMetadata: { locale },
    })
  );

if (only === 'all' || only === 'signup') {
  console.log(
    chalk.bold(`\nSigning up ${username} with locale "${locale}"...`)
  );
  await signUp();
  console.log(chalk.green('ok   SignUp accepted, a code should be on its way'));

  const code = (await question('Confirmation code from the email: ')).trim();
  await client.send(
    new ConfirmSignUpCommand({
      ClientId: clientId,
      Username: username,
      ConfirmationCode: code,
    })
  );
  console.log(chalk.green('ok   ConfirmSignUp succeeded'));
  console.log(chalk.gray(`     password for a manual sign-in: ${password}`));
}

if (only === 'all' || only === 'collisions') {
  console.log(chalk.bold('\nChecking the uniqueness guards...'));

  await expectFailure('duplicate email is refused', signUp, 'already exists');

  await expectFailure(
    'sign up without an email is refused',
    () =>
      client.send(
        new SignUpCommand({
          ClientId: clientId,
          Username: `no-email-${Date.now()}`,
          Password: password,
          UserAttributes: [],
          ClientMetadata: { locale },
        })
      ),
    'email address is required'
  );
}

if (only === 'all' || only === 'resend') {
  console.log(chalk.bold('\nResending the confirmation code...'));
  await client
    .send(
      new ResendConfirmationCodeCommand({
        ClientId: clientId,
        Username: username,
        ClientMetadata: { locale },
      })
    )
    .then(() =>
      console.log(chalk.green('ok   ResendConfirmationCode accepted'))
    )
    .catch((error) =>
      // Expected once the user is confirmed.
      console.log(chalk.gray(`     skipped: ${error.message}`))
    );
}

if (only === 'all' || only === 'reset') {
  console.log(chalk.bold('\nResetting the password...'));
  await client.send(
    new ForgotPasswordCommand({
      ClientId: clientId,
      Username: username,
      ClientMetadata: { locale },
    })
  );
  console.log(chalk.green('ok   ForgotPassword accepted'));

  const resetCode = (await question('Reset code from the email: ')).trim();
  await client.send(
    new ConfirmForgotPasswordCommand({
      ClientId: clientId,
      Username: username,
      ConfirmationCode: resetCode,
      Password: newPassword,
    })
  );
  console.log(chalk.green(`ok   Password reset to ${newPassword}`));
}

console.log(
  chalk.bold(
    `\nDone. Clean up with:\n  aws cognito-idp admin-delete-user --user-pool-id ${env.USER_POOL_ID} --region ${region} --username ${username}`
  )
);
