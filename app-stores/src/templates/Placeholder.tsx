import type { ReactNode } from 'react';
import type { AssetFormat } from '../formats';

// Where the top of the title sits, as a share of the canvas height.
const TITLE_TOP = 0.15;

type Props = {
  format: AssetFormat;
  // The content starts at TITLE_TOP instead of being centered, so the title
  // leading it is at the same position on every screenshot.
  fixedTitle?: boolean;
  children?: ReactNode;
};

export const Placeholder = ({ format, fixedTitle, children }: Props) => {
  const minSide = Math.min(format.width, format.height);

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: fixedTitle ? 'flex-start' : 'center',
        padding: minSide * 0.06,
        paddingTop: fixedTitle ? format.height * TITLE_TOP : minSide * 0.06,
        gap: minSide * 0.08,
        background: '#fff',
        color: 'rgb(106, 106, 106)',
        fontFamily: "'Roboto', sans-serif",
        fontWeight: '400',
      }}
    >
      {children}
    </div>
  );
};
