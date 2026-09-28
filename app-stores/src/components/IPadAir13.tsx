import type { CSSProperties, ReactNode } from 'react';
import '@sneas/telephone/ipad-air-13.js';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'ipad-air-13': {
        mode?: 'light' | 'dark';
        style?: CSSProperties;
        children?: ReactNode;
      };
    }
  }
}

type Props = {
  // The frame width; the height follows the frame's 866×1128 aspect ratio.
  width: CSSProperties['width'];
  children: ReactNode;
  // Merged into the frame's default styles.
  style?: CSSProperties;
};

// Renders children on the screen of an iPad Air 13" frame.
export const IPadAir13 = ({ width, children, style }: Props) => (
  <ipad-air-13 mode="light" style={{ width, flexShrink: 0, ...style }}>
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
  </ipad-air-13>
);
