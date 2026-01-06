/**
 * Content Script Bridge for Firefox
 *
 * Bridges communication between app.vocably.pro and the extension
 * since Firefox doesn't support externally_connectable.
 *
 * Flow:
 * Web Page (app.vocably.pro)
 *   ↓ window.postMessage
 * Content Script (this file, injected into app.vocably.pro)
 *   ↓ browser.runtime.sendMessage
 * Service Worker
 */

import { browserEnv } from './browserEnv';

const ALLOWED_ORIGINS = [
  'https://app.vocably.pro',
  'https://app.dev.env.vocably.pro', // for development
  'http://localhost:8030', // for local testing
  'http://127.0.0.1:8030', // for local testing (alternative)
];

interface ExtensionMessage {
  target: 'vocably-extension';
  identifier: string;
  payload: unknown;
  requestId: string;
}

interface ExtensionResponse {
  target: 'vocably-extension-response';
  requestId: string;
  response?: unknown;
  error?: string;
}

// Listen for messages from the web page
window.addEventListener('message', async (event: MessageEvent) => {
  // Security: Only accept messages from allowed origins
  if (!ALLOWED_ORIGINS.includes(event.origin)) {
    return;
  }

  // Check if this is a message for the extension
  const data = event.data as ExtensionMessage | undefined;
  if (!data || data.target !== 'vocably-extension') {
    return;
  }

  console.log('[Vocably Bridge] Received message:', data.identifier);

  try {
    // Forward the message to the service worker
    // Use type assertion to handle Chrome/Firefox API differences
    const sendMessage = browserEnv.runtime.sendMessage as (
      message: unknown,
      callback: (response: unknown) => void
    ) => void;

    const response = await new Promise((resolve, reject) => {
      sendMessage(
        {
          identifier: data.identifier,
          data: data.payload,
        },
        (result: unknown) => {
          if (browserEnv.runtime.lastError) {
            reject(new Error(browserEnv.runtime.lastError.message));
          } else {
            resolve(result);
          }
        }
      );
    });

    console.log('[Vocably Bridge] Got response for:', data.identifier);

    // Send the response back to the web page
    const responseMessage: ExtensionResponse = {
      target: 'vocably-extension-response',
      requestId: data.requestId,
      response,
    };
    window.postMessage(responseMessage, event.origin);
  } catch (error) {
    console.error('[Vocably Bridge] Error:', error);

    const errorMessage: ExtensionResponse = {
      target: 'vocably-extension-response',
      requestId: data.requestId,
      error: error instanceof Error ? error.message : String(error),
    };
    window.postMessage(errorMessage, event.origin);
  }
});

// Notify the page that the extension bridge is ready
console.log('[Vocably Bridge] Content script loaded, notifying page...');
window.postMessage(
  {
    target: 'vocably-extension-ready',
  },
  window.location.origin
);
