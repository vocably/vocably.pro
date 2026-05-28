/**
 * @format
 */
// Side-effect import: initializes react-i18next synchronously before any
// component renders. Covers both the main app and the share extension because
// both are registered through this same entry file.
import './src/i18n';
import {
  initializePushNotifications,
  onTokenReceived,
} from 'aws-amplify/push-notifications';
import { AppRegistry, LogBox } from 'react-native';
import 'react-native-gesture-handler';
import {
  name as appName,
  shareExtensionName as extensionName,
} from './app.json';
import App from './src/App';
import ShareIntentApp from './src/ShareIntent/ShareExtensionApp';
// We need this to make crud -> nanoid work in RN app
import * as Sentry from '@sentry/react-native';
import { Amplify } from 'aws-amplify';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { AuthStorage } from './src/auth/AuthStorage';
import { awsConfig } from './src/aws-config';
import { notificationsIdentifyUser } from './src/notificationsIdentifyUser';

Amplify.configure(awsConfig);
cognitoUserPoolsTokenProvider.setKeyValueStorage(new AuthStorage());

Sentry.init({
  dsn: 'https://88ec70cfa6b68493c79646625c208280@o1191770.ingest.us.sentry.io/4507980535758848',
});

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

initializePushNotifications();

onTokenReceived((token) => {
  console.log('New token received', token);
  notificationsIdentifyUser();
});

AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerComponent(extensionName, () => ShareIntentApp);
