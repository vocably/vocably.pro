import type { CSSProperties } from 'react';

// The extension's primary color (packages/styles/_variables.scss).
const primary = '#0050ff';

export type ArrowDirection =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'up-left'
  | 'up-right'
  | 'down-left'
  | 'down-right';

// How far the pointer, drawn pointing up-left, turns clockwise to point in
// every direction.
const rotation: Record<ArrowDirection, number> = {
  'up-left': 0,
  up: 45,
  'up-right': 90,
  right: 135,
  'down-right': 180,
  down: 225,
  'down-left': 270,
  left: 315,
};

// A dart with a notched back, its tip at (3, 3) of a 24 × 24 box and its
// wing tips rounded.
const dart =
  'M3 3L20.6 9.5Q21.6 10 20.6 10.5L13.4 13.4L10.5 20.6Q10 21.6 9.5 20.6Z';

// The facet between the tip, the right wing and the notch, lit to give the
// dart an edge down its middle.
const facet = 'M3 3L20.6 9.5Q21.6 10 20.6 10.5L13.4 13.4Z';

// A sleek, flat cursor with a soft glow that points at something on the
// canvas. It fills a square and its tip sits near the corner (or the middle
// of the edge) it points to, so size and place it through `style` (e.g.
// `{ position: 'absolute', left: '60cqmin', top: '20cqmin', width: '6cqmin' }`).
export const Arrow = ({
  direction,
  color = primary,
  style,
}: {
  direction: ArrowDirection;
  color?: string;
  style?: CSSProperties;
}) => (
  <svg
    viewBox="0 0 24 24"
    style={{
      display: 'block',
      aspectRatio: '1',
      overflow: 'visible',
      filter: `drop-shadow(0 0.08em 0.2em ${color}80) drop-shadow(0 0 0.02em ${color})`,
      ...style,
    }}
  >
    <g transform={`rotate(${rotation[direction]} 12 12)`}>
      <path
        d={dart}
        fill={color}
        stroke="#fff"
        strokeWidth="1.4"
        strokeLinejoin="round"
        paintOrder="stroke"
      />
      <path d={facet} fill="#fff" opacity="0.22" />
    </g>
  </svg>
);
