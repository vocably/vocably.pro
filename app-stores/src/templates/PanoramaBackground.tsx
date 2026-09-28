import type { AssetFormat } from '../formats';

// Light base the blobs are drawn over.
const base = '#fdfdff';

// Vibrant blob colors, cycled along the panorama.
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
      alpha: 0.16 + random(n + 100) * 0.08,
    });
    n++;
  };

  for (let i = 0; i < count; i++) {
    add(i + 0.2 + random(n) * 0.4, 0.04 + random(n + 50) * 0.1, 0.55);
    add(i + 0.3 + random(n) * 0.4, 0.82 + random(n + 50) * 0.12, 0.6);
    if (i < count - 1) {
      // Seams alternate between the middle and the lower half.
      add(i + 1, i % 2 === 0 ? 0.42 : 0.6, 0.6 + random(n) * 0.15);
    }
  }
  return result;
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
  const minSide = Math.min(format.width, format.height);
  const layers = blobs(count).map(
    ({ x, y, r, color, alpha }) =>
      `radial-gradient(circle ${r * minSide}px at ${x * format.width}px ${
        y * format.height
      }px, rgba(${color}, ${alpha}), rgba(${color}, ${
        alpha * 0.55
      }) 40%, rgba(${color}, 0))`
  );

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: -index * format.width,
        width: count * format.width,
        height: format.height,
        background: [...layers, base].join(', '),
      }}
    />
  );
};
