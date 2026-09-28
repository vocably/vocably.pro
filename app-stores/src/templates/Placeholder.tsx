import type { ReactNode } from 'react';
import type { AssetFormat } from '../formats';

// Default position of the title's top, as a share of the canvas height.
const TITLE_TOP = 0.15;

type Props = {
  format: AssetFormat;
  // The content starts at titleTop instead of being centered, so the title
  // leading it is at the same position on every screenshot.
  fixedTitle?: boolean;
  // Where the top of the title sits with fixedTitle, as a share of the
  // canvas height.
  titleTop?: number;
  // Drawn behind the content, e.g. a decoration positioned absolutely
  // against the canvas.
  backdrop?: ReactNode;
  children?: ReactNode;
};

export const Placeholder = ({
  format,
  fixedTitle,
  titleTop = TITLE_TOP,
  backdrop,
  children,
}: Props) => {
  const minSide = Math.min(format.width, format.height);

  return (
    <div
      style={{
        height: '100%',
        // A stacking context, so a zIndex -1 backdrop sits above the
        // background but under the content.
        position: 'relative',
        zIndex: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: fixedTitle ? 'flex-start' : 'center',
        padding: minSide * 0.06,
        paddingTop: fixedTitle ? format.height * titleTop : minSide * 0.06,
        gap: minSide * 0.08,
        color: 'rgb(106, 106, 106)',
        fontFamily: "'Roboto', sans-serif",
        fontWeight: '400',
      }}
    >
      {backdrop && (
        <div style={{ position: 'absolute', inset: 0, zIndex: -1 }}>
          {backdrop}
        </div>
      )}
      {children}
    </div>
  );
};
