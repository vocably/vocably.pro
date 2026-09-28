import type { CSSProperties, ReactNode } from 'react';
import '@sneas/telephone/iphone-16-max.js';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'iphone-16-max': {
        mode?: 'light' | 'dark';
        style?: CSSProperties;
        children?: ReactNode;
      };
    }
  }
}

type Props = {
  // The frame width; the height follows the frame's 415×843 aspect ratio.
  width: CSSProperties['width'];
  children: ReactNode;
  // Merged into the frame's default styles.
  style?: CSSProperties;
};

// Renders children on the screen of an iPhone 16 Pro Max frame.
export const IPhone16Max = ({ width, children, style }: Props) => (
  <iphone-16-max mode="light" style={{ width, flexShrink: 0, ...style }}>
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        // Clears the status bar and the Dynamic Island.
        padding: '15% 6%',
        background: '#fff',
        width: '100%',
      }}
    >
      {children}
    </div>
  </iphone-16-max>
);
