import type { CSSProperties, ReactNode } from 'react';
import { deviceShadow } from './deviceShadow';
import '@sneas/telephone/pixel-9-pro.js';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'pixel-9-pro': {
        mode?: 'light' | 'dark';
        style?: CSSProperties;
        children?: ReactNode;
      };
    }
  }
}

type Props = {
  // The frame width; the height follows the frame's 353×745 aspect ratio.
  width: CSSProperties['width'];
  children: ReactNode;
  // Merged into the frame's default styles.
  style?: CSSProperties;
};

// Renders children on the screen of a Pixel 9 Pro frame.
export const Pixel9Pro = ({ width, children, style }: Props) => (
  <pixel-9-pro
    mode="light"
    style={{ width, flexShrink: 0, filter: deviceShadow, ...style }}
  >
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        // Clears the status bar and the camera punch hole.
        padding: '15% 6%',
        background: '#fff',
        width: '100%',
      }}
    >
      {children}
    </div>
  </pixel-9-pro>
);
