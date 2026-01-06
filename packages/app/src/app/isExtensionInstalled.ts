import { pingExternal } from '@vocably/extension-messages';
import {
  BehaviorSubject,
  distinctUntilChanged,
  Observable,
  switchMap,
  timer,
} from 'rxjs';
import { isFirefox } from '../browser';
import { extensionId } from '../extension';

// Firefox detection: listen for the content script bridge ready message
const firefoxExtensionInstalled$ = new BehaviorSubject<boolean>(false);

if (isFirefox) {
  // Check if we already received the ready message
  window.addEventListener('message', (event) => {
    if (event.data?.target === 'vocably-extension-ready') {
      console.log('[isExtensionInstalled] Firefox bridge detected');
      firefoxExtensionInstalled$.next(true);
    }
  });

  // The content script might have already sent the ready message before we started listening
  // Send a ping to check if the bridge is ready
  setTimeout(() => {
    window.postMessage(
      {
        target: 'vocably-extension',
        identifier: 'ping',
        payload: null,
        requestId: 'detect-extension',
      },
      window.location.origin
    );
  }, 100);

  // Listen for ping response
  window.addEventListener('message', (event) => {
    if (
      event.data?.target === 'vocably-extension-response' &&
      event.data?.requestId === 'detect-extension'
    ) {
      console.log('[isExtensionInstalled] Firefox extension responded to ping');
      firefoxExtensionInstalled$.next(true);
    }
  });
}

// Chrome detection: use externally_connectable ping
const chromeExtensionInstalled$: Observable<boolean> = timer(0, 2000).pipe(
  switchMap(() =>
    pingExternal(extensionId)
      .catch(() => undefined)
      .then((result) => result === 'pong')
  ),
  distinctUntilChanged()
);

export const isExtensionInstalled$: Observable<boolean> = isFirefox
  ? firefoxExtensionInstalled$.pipe(distinctUntilChanged())
  : chromeExtensionInstalled$;
