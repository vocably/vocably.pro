import { useId } from 'react';
import type { AssetFormat } from '../formats';

// Light pastel wash the rest is drawn over, cycled along the panorama.
const baseStops = ['#faf9ff', '#f6f9ff', '#fef8fb', '#f5feff', '#fffbf6'];

// Vibrant colors for the blobs and ribbons, cycled along the panorama.
const palette = [
  '99, 102, 241', // indigo
  '236, 72, 153', // pink
  '34, 211, 238', // cyan
  '251, 191, 36', // amber
  '168, 85, 247', // violet
  '52, 211, 153', // emerald
  '251, 113, 133', // rose
  '59, 130, 246', // blue
];

const rgb = (color: string, alpha = 1) => `rgba(${color}, ${alpha})`;

type Blob = {
  // Center, in screenshot widths from the panorama's left edge and in
  // screenshot heights from the top.
  x: number;
  y: number;
  // Radius, in the format's shorter side.
  r: number;
  color: string;
  alpha: number;
};

// Deterministic pseudo-random numbers, so every language and every export
// gets the same background.
const random = (seed: number) => {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
};

// Blobs for a panorama of `count` screenshots. One blob sits on every seam,
// so it spills over into both neighbours and ties them together, and two
// more fill each screenshot, one high and one low.
const blobs = (count: number): Blob[] => {
  const result: Blob[] = [];
  let n = 0;
  const add = (x: number, y: number, r: number) => {
    result.push({
      x,
      y,
      r,
      color: palette[n % palette.length],
      alpha: 0.14 + random(n + 100) * 0.06,
    });
    n++;
  };

  for (let i = 0; i < count; i++) {
    add(i + 0.15 + random(n) * 0.5, 0.02 + random(n + 50) * 0.12, 0.7);
    add(i + 0.25 + random(n) * 0.5, 0.86 + random(n + 50) * 0.12, 0.75);
    if (i < count - 1) {
      // Seams alternate between the middle and the lower half.
      add(i + 1, i % 2 === 0 ? 0.42 : 0.62, 0.65 + random(n) * 0.15);
    }
  }
  return result;
};

type Ribbon = {
  // Centerline, in screenshot heights.
  y: number;
  // Wave amplitude, in screenshot heights.
  amplitude: number;
  // Waves per screenshot width.
  frequency: number;
  phase: number;
  // Thickness, in the format's shorter side.
  thickness: number;
  opacity: number;
  // Indexes into `palette`, spread along the ribbon.
  colors: number[];
};

// Wide translucent bands that flow along the whole panorama and cross every
// seam. They stay near the top and the bottom, around the content.
const ribbons: Ribbon[] = [
  {
    y: 0.06,
    amplitude: 0.045,
    frequency: 0.55,
    phase: 0.4,
    thickness: 0.3,
    opacity: 0.12,
    colors: [0, 4, 1, 3],
  },
  {
    y: 0.86,
    amplitude: 0.06,
    frequency: 0.45,
    phase: 2.2,
    thickness: 0.38,
    opacity: 0.11,
    colors: [2, 7, 5, 6],
  },
  {
    y: 0.8,
    amplitude: 0.07,
    frequency: 0.7,
    phase: 4.1,
    thickness: 0.14,
    opacity: 0.1,
    colors: [1, 3, 0, 2],
  },
];

// The band between two waves: a centerline wave and one that is offset by a
// thickness that swells and thins along the way.
const ribbonPath = (
  ribbon: Ribbon,
  count: number,
  width: number,
  height: number,
  minSide: number
) => {
  const steps = Math.max(48, count * 48);
  const top: string[] = [];
  const bottom: string[] = [];
  for (let s = 0; s <= steps; s++) {
    // Start and end past the panorama's edges so the ends never show.
    const u = -0.1 + ((count + 0.2) * s) / steps;
    const wave = Math.sin(2 * Math.PI * ribbon.frequency * u + ribbon.phase);
    const swell =
      0.55 + 0.45 * Math.sin(2 * Math.PI * ribbon.frequency * 0.6 * u + 1.3);
    const x = (u * width).toFixed(1);
    const center = (ribbon.y + ribbon.amplitude * wave) * height;
    const half = (ribbon.thickness * minSide * swell) / 2;
    top.push(`${x},${(center - half).toFixed(1)}`);
    bottom.unshift(`${x},${(center + half).toFixed(1)}`);
  }
  return `M${top.join('L')}L${bottom.join('L')}Z`;
};

// The centerline of a ribbon, drawn as a fine bright line along its middle.
const ribbonLine = (
  ribbon: Ribbon,
  count: number,
  width: number,
  height: number,
  offset: number
) => {
  const steps = Math.max(48, count * 48);
  const points: string[] = [];
  for (let s = 0; s <= steps; s++) {
    const u = -0.1 + ((count + 0.2) * s) / steps;
    const wave = Math.sin(
      2 * Math.PI * ribbon.frequency * u + ribbon.phase + offset
    );
    points.push(
      `${(u * width).toFixed(1)},${(
        (ribbon.y + ribbon.amplitude * wave) *
        height
      ).toFixed(1)}`
    );
  }
  return `M${points.join('L')}`;
};

type Props = {
  format: AssetFormat;
  // This screenshot's position in the panorama and the panorama's length.
  index: number;
  count: number;
};

// One background spread over every screenshot of a language, so the store
// listing reads as a single continuous strip. Each screenshot shows its own
// slice. The slices meet edge to edge; the store's gap is left out.
export const PanoramaBackground = ({ format, index, count }: Props) => {
  const id = useId();
  const { width, height } = format;
  const minSide = Math.min(width, height);
  const fullWidth = count * width;

  const base = `linear-gradient(115deg, ${baseStops
    .map(
      (color, i) =>
        `${color} ${((i * 100) / (baseStops.length - 1)).toFixed(1)}%`
    )
    .join(', ')})`;

  const layers = blobs(count).map(
    ({ x, y, r, color, alpha }) =>
      `radial-gradient(circle ${r * minSide}px at ${x * width}px ${
        y * height
      }px, ${rgb(color, alpha)}, ${rgb(color, alpha * 0.45)} 45%, ${rgb(
        color,
        0
      )})`
  );

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: -index * width,
        width: fullWidth,
        height,
        background: [...layers, base].join(', '),
      }}
    >
      <svg
        width={fullWidth}
        height={height}
        viewBox={`0 0 ${fullWidth} ${height}`}
        style={{ position: 'absolute', inset: 0 }}
      >
        <defs>
          {ribbons.map((ribbon, r) => (
            <linearGradient
              key={r}
              id={`${id}-ribbon-${r}`}
              gradientUnits="userSpaceOnUse"
              x1={0}
              y1={0}
              x2={fullWidth}
              y2={0}
            >
              {Array.from({ length: count * 2 + 1 }, (_, s) => (
                <stop
                  key={s}
                  offset={s / (count * 2)}
                  stopColor={rgb(
                    palette[ribbon.colors[s % ribbon.colors.length]]
                  )}
                />
              ))}
            </linearGradient>
          ))}
        </defs>
        {ribbons.map((ribbon, r) => (
          <path
            key={r}
            d={ribbonPath(ribbon, count, width, height, minSide)}
            fill={`url(#${id}-ribbon-${r})`}
            opacity={ribbon.opacity}
          />
        ))}
        {ribbons.map((ribbon, r) =>
          [0, 0.35].map((offset) => (
            <path
              key={`${r}-${offset}`}
              d={ribbonLine(ribbon, count, width, height, offset)}
              fill="none"
              stroke={`url(#${id}-ribbon-${r})`}
              strokeWidth={minSide * 0.004}
              strokeLinecap="round"
              opacity={0.28}
            />
          ))
        )}
      </svg>
    </div>
  );
};
