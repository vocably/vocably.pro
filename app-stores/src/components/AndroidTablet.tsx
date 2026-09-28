import type { CSSProperties, ReactNode } from 'react';
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
};

// Renders children on the screen of an Android tablet frame.
export const AndroidTablet = ({ width, children }: Props) => (
  <android-tablet mode="light" style={{ width, flexShrink: 0 }}>
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
