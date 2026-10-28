import type { ComponentType } from 'react';
import { AppStoreHeader } from './AppStoreHeader';
import { AppStoreSearchResults } from './AppStoreSearchResults';
import { ChromeMarqueePromoTile } from './ChromeMarqueePromoTile';
import { ChromeScreenshot } from './ChromeScreenshot';
import { ChromeSmallPromoTile } from './ChromeSmallPromoTile';
import { IPad13 } from './IPad13';
import { IPhone65 } from './IPhone65';
import { PlayFeatureGraphic } from './PlayFeatureGraphic';
import { PlayPhone } from './PlayPhone';
import { PlayTablet10 } from './PlayTablet10';

// One component per format id in src/formats.
export const devices: Record<string, ComponentType> = {
  'ios-iphone-6.5': IPhone65,
  'ios-ipad-13': IPad13,
  'ios-header': AppStoreHeader,
  'ios-search-results': AppStoreSearchResults,
  'play-phone': PlayPhone,
  'play-tablet-10': PlayTablet10,
  'play-feature-graphic': PlayFeatureGraphic,
  'cws-screenshot': ChromeScreenshot,
  'cws-small-promo-tile': ChromeSmallPromoTile,
  'cws-marquee-promo-tile': ChromeMarqueePromoTile,
};
