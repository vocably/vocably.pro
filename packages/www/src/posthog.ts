import type { QualityVotePayload } from '@vocably/model';
import posthog from 'posthog-js';

let isInitialized = false;

/**
 * PostHog runs anonymised: no device metadata, no location, the session only.
 * Safe to call more than once.
 */
export const initPosthog = () => {
  if (isInitialized) {
    return;
  }

  isInitialized = true;
  posthog.init('phc_zSkRhQ7tE4RDFRdxIVXzWwJ66ACL9QAHnyrRpRknyHj', {
    api_host: 'https://api-e.vocably.pro',
    person_profiles: 'identified_only',
    persistence: 'sessionStorage',
    disable_external_dependency_loading: true,
    capture_pageview: false,
    autocapture: false,
    disable_session_recording: true,
    disable_surveys: true,
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
};

/**
 * The same event and properties as the extension and the mobile app send.
 */
export const captureQualityVote = async (payload: QualityVotePayload) => {
  initPosthog();
  posthog.capture('cardQualityVoted', payload);
};
