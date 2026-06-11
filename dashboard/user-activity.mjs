import { exec } from 'child_process';
import { config } from 'dotenv-flow';
import { inspect, promisify } from 'node:util';
import 'zx/globals';

config();

const execute = promisify(exec);

const userEmailOrSub = process.argv[2];

let sub = userEmailOrSub;

if (userEmailOrSub.includes('@')) {
  const listUsers = `aws cognito-idp list-users --user-pool-id ${process.env.USER_POOL_ID} --filter "email=\\"${userEmailOrSub}\\""`;

  const users = JSON.parse((await execute(listUsers)).stdout);

  console.log('Received users', inspect(users, { depth: null }));

  sub = users.Users[0].Attributes.find((attr) => attr.Name === 'sub').Value;
}

let userCardCollections = [];

try {
  userCardCollections = JSON.parse(
    (
      await execute(
        `aws s3api list-objects --bucket ${process.env.DECKS_BUCKET} --prefix "${sub}/"`
      )
    ).stdout
  ).Contents;
} catch (error) {
  console.error(error);
}

for (const userCardCollection of userCardCollections) {
  const cardCollection = JSON.parse(
    (
      await execute(
        `aws s3 cp s3://${process.env.DECKS_BUCKET}/${userCardCollection.Key} -`,
        { maxBuffer: 10 * 1024 * 1024 }
      )
    ).stdout || '""'
  );

  console.log(userCardCollection.Key, cardCollection.cards.length);
}

try {
  const userMetadata = JSON.parse(
    (
      await execute(
        `aws s3 cp s3://${process.env.USER_FILES_BUCKET}/${sub}/files/metadata.json -`
      )
    ).stdout || '""'
  );

  console.log('User metadata', inspect(userMetadata, { depth: null }));
} catch (error) {
  console.log("Can't read user metadata.", error.toString());
}

try {
  const userStaticMetadata = JSON.parse(
    (
      await execute(
        `aws s3 cp s3://${process.env.USER_STATIC_FILES_BUCKET}/${sub}/static-metadata.json -`
      )
    ).stdout || '""'
  );

  console.log(
    'User static metadata',
    inspect(userStaticMetadata, { depth: null })
  );
} catch (error) {
  console.log("Can't read user static metadata.", error.toString());
}

try {
  const studyStreak = JSON.parse(
    (
      await execute(
        `aws s3 cp s3://${process.env.USER_FILES_BUCKET}/${sub}/files/study-streak.json -`
      )
    ).stdout || '""'
  );

  console.log('Study streak', inspect(studyStreak, { depth: null }));
} catch (error) {
  console.log('Study streak', error.toString());
}
