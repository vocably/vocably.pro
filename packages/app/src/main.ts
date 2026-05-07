import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import '@sneas/telephone/iphone-16-max';

import { Auth } from '@aws-amplify/auth';
import { initializePaddle } from '@paddle/paddle-js';
import * as Sentry from '@sentry/angular';

import { configureApi } from '@vocably/api';
import posthog from 'posthog-js';
import { maintainAppSize } from './app-size';
import { AppModule } from './app/app.module';
import { authConfig } from './auth-config';
import { environment } from './environments/environment';
import { setupFirefoxVariables } from './firefox';

setupFirefoxVariables();

initializePaddle({
  token: environment.paddleClientSideToken,
  environment: environment.paddleClientSideToken.startsWith('test')
    ? 'sandbox'
    : 'production',
  debug: !environment.production,
});

posthog.init('phc_vke56i7RTlBbFYHZHsoH7VhgWi2DwvKtEzusfcFemgT', {
  api_host: 'https://api-b.vocably.pro',
  person_profiles: 'identified_only',
});

Sentry.init({
  environment: environment.sentryEnvironment,
  dsn: 'https://3e78a7263b224f07a7316c655d40a415@o1191770.ingest.sentry.io/6313273',
  integrations: [Sentry.browserTracingIntegration()],

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

if (environment.production) {
  enableProdMode();
}

Auth.configure(authConfig);

configureApi({
  ...environment.api,
  getJwtToken: () =>
    Auth.currentSession().then((session) => session.getIdToken().getJwtToken()),
});

maintainAppSize();

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch((err) => console.error(err));
