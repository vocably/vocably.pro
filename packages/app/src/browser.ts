import * as Bowser from 'bowser';

export const browser = Bowser.getParser(window.navigator.userAgent);

export const isIOS = (): boolean => {
  return (
    [
      'iPad Simulator',
      'iPhone Simulator',
      'iPod Simulator',
      'iPad',
      'iPhone',
      'iPod',
    ].includes(navigator.platform) ||
    // iPad on iOS 13 detection
    (navigator.userAgent.includes('Mac') && 'ontouchend' in document)
  );
};

export const isIOSSafari =
  isIOS() &&
  !!browser.satisfies({
    safari: '>10.1',
  });

export const isMacSafari = !!browser.satisfies({
  macos: {
    safari: '>10.1',
  },
});

export const isChrome = !!browser.satisfies({
  desktop: {
    chrome: '>0',
  },
});

export const isFirefox = !!browser.satisfies({
  desktop: {
    firefox: '>0',
  },
});

export const isDesktop = browser.getPlatformType() === 'desktop';

export const browserType: 'desktop-safari' | 'ios-safari' | 'normal' =
  isIOS() && browser.satisfies({ safari: '>0' })
    ? 'ios-safari'
    : browser.satisfies({ macos: { safari: '>0' } })
    ? 'desktop-safari'
    : 'normal';
