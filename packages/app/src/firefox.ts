import { BehaviorSubject } from 'rxjs';

export let isFirefox = localStorage.getItem('allowFirefox') === 'true';

export const setupFirefoxVariables = () => {
  if (location.search.includes('firefox')) {
    localStorage.setItem('allowFirefox', 'true');
    isFirefox = true;
  }

  if (location.search.includes('firethefox')) {
    localStorage.removeItem('allowFirefox');
    isFirefox = false;
  }

  if (isFirefox) {
    console.log('[isFirefox] Firefox detected');
  }
};

export const firefoxExtensionInstalled$ = new BehaviorSubject<boolean>(false);

window.addEventListener('message', (event) => {
  if (event.data?.target === 'vocably-extension-ready') {
    console.log('[isExtensionInstalled] Firefox bridge detected');
    firefoxExtensionInstalled$.next(true);
  }
});

window.addEventListener('message', (event) => {
  if (
    event.data?.target === 'vocably-extension-response' &&
    event.data?.requestId === 'detect-extension'
  ) {
    console.log('[isExtensionInstalled] Firefox extension responded to ping');
    firefoxExtensionInstalled$.next(true);
  }
});

export const pingFirefoxExtension = () => {
  window.postMessage(
    { target: 'vocably-extension', requestId: 'detect-extension' },
    window.location.origin
  );
};
