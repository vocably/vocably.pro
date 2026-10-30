export type Store = 'app-store' | 'google-play' | 'chrome-web-store';

export type AssetFormat = {
  id: string;
  store: Store;
  name: string;
  width: number;
  height: number;
  gap?: number;
};

// https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications
// https://support.google.com/googleplay/android-developer/answer/9866151
// https://developer.chrome.com/docs/webstore/images
export const formats: AssetFormat[] = [
  {
    id: 'ios-iphone-6.5',
    store: 'app-store',
    name: 'iPhone 6.5"',
    width: 1284,
    height: 2778,
    // Reported as 107.25px at 1242px wide (developer.apple.com/forums/thread/725435).
    gap: 111,
  },
  {
    id: 'ios-ipad-13',
    store: 'app-store',
    name: 'iPad 13"',
    width: 2064,
    height: 2752,
    gap: 100,
  },
  {
    id: 'ios-header',
    store: 'app-store',
    name: 'Header',
    width: 5244,
    height: 2950,
  },
  {
    id: 'ios-search-results',
    store: 'app-store',
    name: 'Search results',
    width: 5244,
    height: 2950,
  },
  {
    id: 'play-phone',
    store: 'google-play',
    name: 'Phone screenshot',
    width: 1080,
    height: 1920,
    gap: 80,
  },
  {
    id: 'play-tablet-10',
    store: 'google-play',
    name: '10" tablet screenshot',
    width: 1600,
    height: 2560,
    gap: 100,
  },
  {
    id: 'play-feature-graphic',
    store: 'google-play',
    name: 'Feature graphic',
    width: 1024,
    height: 500,
  },
  {
    id: 'cws-screenshot',
    store: 'chrome-web-store',
    name: 'Screenshot',
    width: 1280,
    height: 800,
    gap: 54,
  },
  {
    id: 'cws-small-promo-tile',
    store: 'chrome-web-store',
    name: 'Small promo tile',
    width: 440,
    height: 280,
  },
  {
    id: 'cws-marquee-promo-tile',
    store: 'chrome-web-store',
    name: 'Marquee promo tile',
    width: 1400,
    height: 560,
  },
];

export const getFormat = (id: string) => {
  const format = formats.find((f) => f.id === id);
  if (!format) throw new Error(`Unknown format: ${id}`);
  return format;
};
