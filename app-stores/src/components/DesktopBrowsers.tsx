import type { CSSProperties } from 'react';

// public/mac.png is a 3840×2160 MacBook on a white background. These are the
// laptop's bounds in it and the screen's bounds within the laptop, as
// percentages, so the frame can be cropped to the laptop and the icons laid
// over the screen.
const laptop = { left: 14.75, top: 4.9, width: 70.5, height: 84.9 };
const screen = { left: 8.5, top: 2.2, right: 8.5, bottom: 18 };

export type Browser = 'chrome' | 'safari' | 'edge';

type Props = {
  // The icons from left to right. The middle one is drawn on top.
  browsers?: [Browser, Browser, Browser];
  style?: CSSProperties;
};

// A MacBook with the Chrome, Safari and Edge icons overlapping on its screen.
export const DesktopBrowsers = ({
  browsers = ['chrome', 'safari', 'edge'],
  style,
}: Props) => (
  <div
    style={{
      position: 'relative',
      width: '100%',
      flexShrink: 0,
      // Pushed to the bottom of the Placeholder's flex column.
      marginTop: 'auto',
      aspectRatio: `${(laptop.width * 3840) / (laptop.height * 2160)}`,
      overflow: 'hidden',
      ...style,
    }}
  >
    <img
      src={`${import.meta.env.BASE_URL}mac.png`}
      style={{
        position: 'absolute',
        width: `${10000 / laptop.width}%`,
        left: `-${(laptop.left * 100) / laptop.width}%`,
        top: `-${(laptop.top * 100) / laptop.height}%`,
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: `${screen.left}%`,
        top: `${screen.top}%`,
        right: `${screen.right}%`,
        bottom: `${screen.bottom}%`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        containerType: 'size',
      }}
    >
      {browsers.map((browser, index) => (
        <img
          key={browser}
          src={`${import.meta.env.BASE_URL}browsers/${browser}.svg`}
          style={{
            position: 'relative',
            zIndex: index === 1 ? 1 : 0,
            width: '40cqh',
            height: '40cqh',
            // Each icon covers a quarter of the one before it.
            marginLeft: index === 0 ? 0 : '-10cqh',
            filter: 'drop-shadow(0 1.5cqh 3cqh rgba(0, 0, 0, 0.25))',
          }}
        />
      ))}
    </div>
  </div>
);
