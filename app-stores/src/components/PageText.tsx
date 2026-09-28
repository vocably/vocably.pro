import type { CSSProperties, ReactNode } from 'react';

type Props = {
  before: string;
  after: string;
  // The selected text, with its highlight and handles.
  children: ReactNode;
  // Room for the selection handles above and below the line, which the fade
  // mask would clip otherwise. Doesn't change the layout.
  overflow: { top: string; bottom: string };
  style?: CSSProperties;
};

// Fades the page text in on the left and out on the right, so the excerpt
// reads as part of a longer sentence.
const fade =
  'linear-gradient(to right, transparent, #000 25%, #000 75%, transparent)';

// A line of web page text with a selection in the middle.
export const PageText = ({
  before,
  after,
  children,
  overflow,
  style,
}: Props) => (
  <div
    style={{
      fontFamily: "'Merriweather', serif",
      fontSize: '5cqmin',
      lineHeight: 1.7,
      color: '#333',
      textAlign: 'center',
      ...style,
    }}
  >
    <span
      style={{
        display: 'inline-block',
        // The mask clips to the border box.
        padding: `${overflow.top} 0 ${overflow.bottom}`,
        margin: `-${overflow.top} 0 -${overflow.bottom}`,
        maskImage: fade,
        WebkitMaskImage: fade,
      }}
    >
      {before}
      {children}
      {after}
    </span>
  </div>
);
