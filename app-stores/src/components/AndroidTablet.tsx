import type { CSSProperties, ReactNode } from 'react';
import { deviceShadow } from './deviceShadow';
import '@sneas/telephone/android-tablet.js';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'android-tablet': {
        mode?: 'light' | 'dark';
        style?: CSSProperties;
        children?: ReactNode;
      };
    }
  }
}

type Props = {
  // The frame width; the height follows the frame's 864×1342 aspect ratio.
  width: CSSProperties['width'];
  children: ReactNode;
  // Merged into the frame's default styles.
  style?: CSSProperties;
};

// Renders children on the screen of an Android tablet frame.
export const AndroidTablet = ({ width, children, style }: Props) => (
  <android-tablet
    mode="light"
    style={{ width, flexShrink: 0, filter: deviceShadow, ...style }}
  >
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        // Clears the status bar.
        padding: '6% 6%',
        background: '#fff',
        width: '100%',
      }}
    >
      {children}
    </div>
  </android-tablet>
);
