import { useId, type CSSProperties } from 'react';

type Props = {
  style?: CSSProperties;
};

// Compass tick marks: a long one every 30°, short ones in between.
const ticks = Array.from({ length: 72 }, (_, i) => i * 5);

// The iOS Safari compass. The viewBox is centered on it, radius 50.
export const SafariIcon = ({ style }: Props) => {
  // Unique gradient ids, so several icons on one page don't clash.
  const face = `${useId().replace(/[^a-zA-Z0-9_-]/g, '')}-face`;

  return (
    <svg viewBox="-50 -50 100 100" style={style}>
      <defs>
        <linearGradient id={face} x1="0" y1="-1" x2="0" y2="1">
          <stop offset="0" stopColor="#1ad6fd" />
          <stop offset="1" stopColor="#1d62f0" />
        </linearGradient>
      </defs>

      <circle r="50" fill="#fff" />
      <circle r="46" fill={`url(#${face})`} />
      {ticks.map((angle) => (
        <line
          key={angle}
          y1={-43}
          y2={angle % 30 === 0 ? -36 : -39.5}
          stroke="#fff"
          strokeWidth={angle % 30 === 0 ? 1.4 : 0.8}
          strokeLinecap="round"
          transform={`rotate(${angle})`}
        />
      ))}

      <g transform="rotate(45)">
        <path d="M -5.5 0 L 0 -34 L 5.5 0 Z" fill="#ff3b30" />
        <path d="M -5.5 0 L 0 34 L 5.5 0 Z" fill="#fff" />
      </g>
    </svg>
  );
};

// A big Safari icon in the top right corner of the canvas, partly cut off by
// the edges. Sized in cqmin, relative to the format. `offset` is how far, in
// cqmin, the icon is pushed past the top and right edges.
export const SafariCorner = ({
  offset = [4, 4],
}: {
  offset?: [number, number];
}) => (
  <SafariIcon
    style={{
      position: 'absolute',
      top: `-${offset[0]}cqmin`,
      right: `-${offset[1]}cqmin`,
      width: '36cqmin',
      height: '36cqmin',
      filter: 'drop-shadow(0 0.5cqmin 1.5cqmin rgba(0, 0, 0, 0.25))',
    }}
  />
);
