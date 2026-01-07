import { pingExternal } from '@vocably/extension-messages';
import { distinctUntilChanged, Observable, switchMap, timer } from 'rxjs';
import { extensionId } from '../extension';
import { isFirefox, pingFirefoxExtension } from '../firefox';

export const isExtensionInstalled$: Observable<boolean> = timer(0, 2000).pipe(
  switchMap(() => {
    if (isFirefox) {
      pingFirefoxExtension();
      return isExtensionInstalled$;
    }

    return pingExternal(extensionId)
      .catch(() => undefined)
      .then((result) => result === 'pong');
  }),
  distinctUntilChanged()
);
