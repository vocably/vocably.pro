import type { ReactNode } from 'react';

// public/iphone-01.png is a 1281×2001 iPhone turned in 3D, with its shadow,
// on a transparent background. Its screen is opaque white.
const image = { width: 1281, height: 2001 };

// The screen's corners in the image, in its pixels, where its straight edges
// would meet without the rounded corners.
const corners = {
  topLeft: [300.5, 98.5],
  topRight: [988.7, 146.7],
  bottomRight: [984.5, 1683.2],
  bottomLeft: [303.4, 1742.8],
} as const;

// The flat screen the content is laid out on before it is projected onto the
// corners: the iPhone 16 Pro Max's 440×956 points.
const screen = { width: 440, height: 956 };

// The CSS matrix3d that maps the screen rectangle onto the corners (a
// rectangle-to-quadrilateral projective transform).
const projection = () => {
  const [x0, y0] = corners.topLeft;
  const [x1, y1] = corners.topRight;
  const [x2, y2] = corners.bottomRight;
  const [x3, y3] = corners.bottomLeft;
  const dx1 = x1 - x2;
  const dx2 = x3 - x2;
  const dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2;
  const dy2 = y3 - y2;
  const dy3 = y0 - y1 + y2 - y3;
  const det = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / det;
  const h = (dx1 * dy3 - dx3 * dy1) / det;
  const a = x1 - x0 + g * x1;
  const b = x3 - x0 + h * x3;
  const d = y1 - y0 + g * y1;
  const e = y3 - y0 + h * y3;
  const { width: w, height: hh } = screen;

  return `matrix3d(${[
    a / w,
    d / w,
    0,
    g / w,
    b / hh,
    e / hh,
    0,
    h / hh,
    0,
    0,
    1,
    0,
    x0,
    y0,
    0,
    1,
  ].join(', ')})`;
};

// The iOS status bar in the screen's points: the time in the left ear of the
// Dynamic Island, the cellular, Wi-Fi and battery icons in the right one,
// both centered on the island's height.
const StatusBar = () => (
  <div
    style={{
      position: 'absolute',
      left: 0,
      top: 0,
      right: 0,
      height: 62,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '4px 34px 0 52px',
      fontFamily: "-apple-system, 'SF Pro Text', 'Roboto', sans-serif",
      fontSize: 17,
      fontWeight: 600,
      color: '#000',
    }}
  >
    <span style={{ width: 54, textAlign: 'center' }}>9:41</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {/* Cellular */}
      <svg width={19} height={12} viewBox="0 0 19 12" fill="#000">
        <rect x={0} y={7.5} width={3.2} height={4.5} rx={1} />
        <rect x={5.1} y={5} width={3.2} height={7} rx={1} />
        <rect x={10.2} y={2.5} width={3.2} height={9.5} rx={1} />
        <rect x={15.3} y={0} width={3.2} height={12} rx={1} />
      </svg>
      {/* Wi-Fi */}
      <svg
        width={17}
        height={12}
        viewBox="0 0 17 12"
        fill="none"
        stroke="#000"
        strokeWidth={2.2}
        strokeLinecap="round"
      >
        <path d="M1.3 4.3a10.2 10.2 0 0 1 14.4 0" />
        <path d="M4.3 7.2a6 6 0 0 1 8.4 0" />
        <path d="M7.4 10.2a1.6 1.6 0 0 1 2.2 0" />
      </svg>
      {/* Battery */}
      <svg width={27} height={13} viewBox="0 0 27 13" fill="#000">
        <rect
          x={0.5}
          y={0.5}
          width={24}
          height={12}
          rx={3.8}
          fill="none"
          stroke="#000"
          strokeOpacity={0.35}
        />
        <rect x={2} y={2} width={21} height={9} rx={2.5} />
        <path d="M25.5 4.5v4a2.2 2.2 0 0 0 0-4z" fillOpacity={0.4} />
      </svg>
    </div>
  </div>
);

type Props = {
  // The image width in pixels of the canvas; the height follows the image's
  // aspect ratio. The projection is in pixels, so this can't be in cqmin.
  width: number;
  children: ReactNode;
};

// Renders children on the screen of an iPhone turned in 3D.
export const IPhone3D = ({ width, children }: Props) => (
  <div
    style={{
      position: 'relative',
      width,
      height: (width * image.height) / image.width,
    }}
  >
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: image.width,
        height: image.height,
        transform: `scale(${width / image.width})`,
        transformOrigin: '0 0',
      }}
    >
      <img
        src={`${import.meta.env.BASE_URL}iphone-01.png`}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: screen.width,
          height: screen.height,
          transform: projection(),
          transformOrigin: '0 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          // Clears the status bar and the Dynamic Island. The screen is
          // the image's white, so the content has no background.
          padding: '12% 3%',
        }}
      >
        <StatusBar />
        {children}
      </div>
    </div>
  </div>
);
