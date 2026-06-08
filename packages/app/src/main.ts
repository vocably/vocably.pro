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

const ph = posthog.init('phc_zSkRhQ7tE4RDFRdxIVXzWwJ66ACL9QAHnyrRpRknyHj', {
  api_host: 'https://api-e.vocably.pro',
  persistence: 'memory',
  mask_personal_data_properties: true,
  before_send: (event) => {
    if (event && event.properties) {
      // 1. Remove standard device metadata properties that can aid fingerprinting
      delete event.properties['$device_id'];
      delete event.properties['$device_name'];
      delete event.properties['$device_model'];
      delete event.properties['$device_manufacturer'];
      delete event.properties['$os_version'];
      delete event.properties['$os_name'];

      // 2. Clear out explicit network or location keys to guarantee anonymity
      delete event.properties['$ip'];
      delete event.properties['$geoip_city_name'];
      delete event.properties['$geoip_country_code'];
      delete event.properties['$geoip_country_name'];
    }

    // Return the sanitized event back to the pipeline
    return event;
  },
});

ph.identify(ph.get_distinct_id());

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
