import { NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoModule } from '@jsverse/transloco';
import {
  isAndroid,
  isChrome,
  isEdge,
  isIOS,
  isIOSSafari,
  isMacSafari,
} from '../../../browser';
import { isFirefox } from '../../../firefox';
import { isExtensionInstalled$ } from '../../isExtensionInstalled';

type ExtensionBrowser = {
  name: string;
  icon: string;
};

const getExtensionBrowser = (): ExtensionBrowser | undefined => {
  // Android has no extension to offer.
  if (isAndroid) {
    return undefined;
  }

  if (isIOSSafari) {
    return { name: 'iOS Safari', icon: 'assets/browsers/safari.svg' };
  }

  if (isMacSafari) {
    return { name: 'Safari', icon: 'assets/browsers/safari.svg' };
  }

  if (isFirefox) {
    return { name: 'Firefox', icon: 'assets/browsers/firefox.svg' };
  }

  if (isEdge) {
    return { name: 'Edge', icon: 'assets/browsers/edge.svg' };
  }

  if (isChrome) {
    return { name: 'Chrome', icon: 'assets/browsers/chrome.svg' };
  }

  return undefined;
};

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
  imports: [NgIf, TranslocoModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CarouselComponent {
  isIOS = isIOS();

  extensionBrowser = getExtensionBrowser();

  // Undefined until the first ping answers, so neither line flashes before the
  // answer is known.
  isExtensionInstalled = toSignal(isExtensionInstalled$, {
    initialValue: undefined,
  });
}
