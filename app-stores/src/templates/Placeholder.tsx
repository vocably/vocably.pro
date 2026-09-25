import type { ReactNode } from 'react';
import type { AssetFormat } from '../formats';

type Props = {
  format: AssetFormat;
  label?: string;
  children?: ReactNode;
};

export const Placeholder = ({ format, label, children }: Props) => {
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
        color: '#000',
        fontFamily: "'Ruda', sans-serif",
      }}
    >
      {children}
    </div>
  );
};
