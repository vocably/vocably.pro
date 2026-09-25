import type { ReactNode } from 'react';
import type { AssetFormat } from '../formats';

type Props = {
  format: AssetFormat;
  children?: ReactNode;
};

export const Placeholder = ({ format, children }: Props) => {
  const minSide = Math.min(format.width, format.height);

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: minSide * 0.06,
        gap: minSide * 0.08,
        background: '#fff',
        color: 'rgb(106, 106, 106)',
        fontFamily: "'Ruda', sans-serif",
      }}
    >
      {children}
    </div>
  );
};
