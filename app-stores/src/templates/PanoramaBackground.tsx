import { useId } from 'react';
import type { AssetFormat } from '../formats';

// White copybook paper, ruled in lines.
const base = '#fff';
const ruleColor = 'rgba(96, 140, 210, 0.14)';
// Shade on both sides of a seam, where two pages meet.
const gutterColor = '42, 64, 112';

// Muted watercolor tones for the ribbons, cycled along the panorama, so
// they read as washes soaked into the paper.
const palette = [
  '86, 104, 150', // slate blue
  '196, 110, 92', // terracotta
  '102, 150, 140', // sage teal
  '214, 162, 72', // ochre
  '134, 106, 150', // dusty plum
  '122, 154, 98', // olive green
  '204, 128, 120', // faded rose
  '92, 130, 170', // denim
];

const rgb = (color: string, alpha = 1) => `rgba(${color}, ${alpha})`;

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
    opacity: 0.07,
    colors: [0, 4, 1, 3],
  },
  {
    y: 0.86,
    amplitude: 0.06,
    frequency: 0.45,
    phase: 2.2,
    thickness: 0.38,
    opacity: 0.065,
    colors: [2, 7, 5, 6],
  },
  {
    y: 0.8,
    amplitude: 0.07,
    frequency: 0.7,
    phase: 4.1,
    thickness: 0.14,
    opacity: 0.06,
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
  // Paper grain and fibres. The noise is defined in panorama coordinates, so
  // it only has to be drawn over this screenshot's slice and still lines up
  // with its neighbours.
  const grainFrequency = 420 / minSide;
  const fibreFrequency = 28 / minSide;
  const fullWidth = count * width;

  // Rows of about 1/16 of the shorter side.
  const row = minSide / 16;
  const line = Math.max(1, minSide * 0.0014);
  // The margin rule runs down every page, near its right edge.
  const margin = width - minSide * 0.08;
  const gutter = width * 0.06;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: -index * width,
        width: fullWidth,
        height,
        backgroundColor: base,
        backgroundImage: `linear-gradient(to top, ${ruleColor} ${line}px, transparent ${line}px)`,
        backgroundSize: `100% ${row}px`,
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
          <linearGradient id={`${id}-gutter`} x1={0} y1={0} x2={1} y2={0}>
            <stop offset={0} stopColor={rgb(gutterColor, 0)} />
            <stop offset={0.5} stopColor={rgb(gutterColor, 0.07)} />
            <stop offset={1} stopColor={rgb(gutterColor, 0)} />
          </linearGradient>
          <filter
            id={`${id}-fibres`}
            filterUnits="userSpaceOnUse"
            x={index * width}
            y={0}
            width={width}
            height={height}
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency={`${fibreFrequency} ${fibreFrequency * 2.5}`}
              numOctaves={4}
              seed={7}
            />
            <feDiffuseLighting
              surfaceScale={minSide * 0.0012}
              lightingColor="#fff"
            >
              <feDistantLight azimuth={45} elevation={58} />
            </feDiffuseLighting>
          </filter>
          <filter
            id={`${id}-grain`}
            filterUnits="userSpaceOnUse"
            x={index * width}
            y={0}
            width={width}
            height={height}
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency={grainFrequency}
              numOctaves={2}
              seed={3}
            />
            <feColorMatrix values="0 0 0 0 0.2  0 0 0 0 0.26  0 0 0 0 0.4  0 0 0 -1.6 1.05" />
          </filter>
        </defs>
        {Array.from({ length: count }, (_, page) => (
          <line
            key={page}
            x1={page * width + margin}
            y1={0}
            x2={page * width + margin}
            y2={height}
            stroke={ruleColor}
            strokeWidth={line * 1.6}
          />
        ))}
        {Array.from({ length: count - 1 }, (_, seam) => (
          <rect
            key={seam}
            x={(seam + 1) * width - gutter}
            y={0}
            width={gutter * 2}
            height={height}
            fill={`url(#${id}-gutter)`}
          />
        ))}
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
              opacity={0.18}
            />
          ))
        )}
        <rect
          x={index * width}
          y={0}
          width={width}
          height={height}
          filter={`url(#${id}-fibres)`}
          opacity={0.04}
          style={{ mixBlendMode: 'multiply' }}
        />
        <rect
          x={index * width}
          y={0}
          width={width}
          height={height}
          filter={`url(#${id}-grain)`}
          opacity={0.06}
        />
      </svg>
    </div>
  );
};
