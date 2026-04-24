import { fetchAuthSession } from 'aws-amplify/auth';
import { singlePromise } from '@vocably/sulna';

// We explicitly don't want to accept any extra params
// Because maintaining extra params is a pain
export const safeFetchAuthSession: () => ReturnType<typeof fetchAuthSession> =
  singlePromise(fetchAuthSession);
