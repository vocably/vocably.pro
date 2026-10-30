import type { CSSProperties, ReactNode } from 'react';

// Colors of Google Meet's dark call screen.
const background = '#202124';
const tile = '#3c4043';
const button = '#3c4043';
const hangUp = '#ea4335';

// Material Design Icons.
const microphone =
  'M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z';
const video =
  'M17,10.5V7A1,1 0 0,0 16,6H4A1,1 0 0,0 3,7V17A1,1 0 0,0 4,18H16A1,1 0 0,0 17,17V13.5L21,17.5V6.5L17,10.5Z';
const phoneHangUp =
  'M12,9C10.4,9 8.85,9.25 7.4,9.72V12.82C7.4,13.22 7.17,13.56 6.84,13.72C5.86,14.21 4.97,14.84 4.17,15.57C4,15.75 3.75,15.86 3.5,15.86C3.2,15.86 2.95,15.74 2.77,15.56L0.29,13.08C0.11,12.9 0,12.65 0,12.38C0,12.1 0.11,11.85 0.29,11.67C3.34,8.77 7.46,7 12,7C16.54,7 20.66,8.77 23.71,11.67C23.89,11.85 24,12.1 24,12.38C24,12.65 23.89,12.9 23.71,13.08L21.23,15.56C21.05,15.74 20.8,15.86 20.5,15.86C20.25,15.86 20,15.75 19.82,15.57C19.03,14.84 18.14,14.21 17.16,13.72C16.83,13.56 16.6,13.22 16.6,12.82V9.72C15.15,9.25 13.6,9 12,9Z';

const Tile = ({
  name,
  children,
  style,
}: {
  name: string;
  children: ReactNode;
  style?: CSSProperties;
}) => (
  <div
    style={{
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '0.8em',
      background: tile,
      ...style,
    }}
  >
    {children}
    <span
      style={{
        position: 'absolute',
        left: '0.9em',
        bottom: '0.7em',
        fontSize: '0.9em',
        color: '#fff',
        textShadow: '0 0 0.3em rgba(0, 0, 0, 0.6)',
      }}
    >
      {name}
    </span>
  </div>
);

const Button = ({ path, color }: { path: string; color: string }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: color === hangUp ? '4.4em' : '2.8em',
      height: '2.8em',
      borderRadius: '1.4em',
      background: color,
    }}
  >
    <svg
      viewBox="0 0 24 24"
      fill="#fff"
      style={{ display: 'block', width: '1.4em', height: '1.4em' }}
    >
      <path d={path} />
    </svg>
  </div>
);

const Avatar = ({ letter, color }: { letter: string; color: string }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '3.6em',
      height: '3.6em',
      borderRadius: '50%',
      background: color,
      color: '#fff',
      fontSize: '1.6em',
    }}
  >
    {letter}
  </div>
);

// Hair in front of the head, and for long hair also behind it, in the
// <Person> viewBox.
const hairStyles = {
  long: {
    back: 'M35,44 C31,16 47,12 60,12 C75,12 90,18 86,44 C87,60 90,72 96,82 L24,82 C30,72 34,58 35,44 Z',
    front:
      'M37,46 C34,22 46,14 61,14 C77,14 87,24 84,46 C81,34 74,26 63,24 C57,31 47,35 38,37 Z',
  },
  short: {
    back: '',
    front:
      'M37,42 C35,20 47,12 61,12 C76,12 87,21 83,42 C81,33 78,28 73,27 C65,31 52,30 44,27 C40,31 38,36 37,42 Z',
  },
};

// A person facing the camera from the chest up, anchored to the bottom of the
// tile. `height` is in CSS units; a percentage is of the tile, and at 92% the
// head sits just above the middle.
const Person = ({
  shirt,
  hair,
  skin,
  hairStyle,
  height = '6.6em',
}: {
  shirt: string;
  hair: string;
  skin: string;
  hairStyle: keyof typeof hairStyles;
  height?: string;
}) => {
  const { back, front } = hairStyles[hairStyle];
  const shade = 'rgba(0, 0, 0, 0.15)';
  const feature = 'rgba(40, 24, 16, 0.85)';
  return (
    <svg
      viewBox="0 0 120 110"
      style={{
        position: 'relative',
        display: 'block',
        height,
        aspectRatio: '120 / 110',
      }}
    >
      {back && <path d={back} fill={hair} />}
      {/* Neck, shaded under the chin. */}
      <rect x="51" y="60" width="18" height="20" fill={skin} />
      <rect x="51" y="60" width="18" height="10" fill={shade} />
      {/* Shoulders and a round neckline. */}
      <path
        d="M6,110 C6,88 26,78 49,75 L71,75 C94,78 114,88 114,110 Z"
        fill={shirt}
      />
      <path d="M49,75 Q60,88 71,75 Z" fill={skin} />
      <path
        d="M49,75 Q60,88 71,75"
        fill="none"
        stroke={shade}
        strokeWidth="2"
      />
      {/* Ears and head. */}
      <ellipse cx="38.5" cy="48" rx="4" ry="6" fill={skin} />
      <ellipse cx="81.5" cy="48" rx="4" ry="6" fill={skin} />
      <ellipse cx="38.5" cy="48" rx="2" ry="3.5" fill={shade} />
      <ellipse cx="81.5" cy="48" rx="2" ry="3.5" fill={shade} />
      <ellipse cx="60" cy="45" rx="22" ry="26" fill={skin} />
      {/* Face. */}
      <path
        d="M46,39 Q51,36.5 56,38.5 M64,38.5 Q69,36.5 74,39"
        fill="none"
        stroke={hair}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <ellipse cx="51" cy="46" rx="3" ry="2.2" fill="#fff" />
      <ellipse cx="69" cy="46" rx="3" ry="2.2" fill="#fff" />
      <circle cx="51.3" cy="46" r="1.8" fill={feature} />
      <circle cx="69.3" cy="46" r="1.8" fill={feature} />
      <path
        d="M60,47 Q57.5,54 59,56 Q60.5,57 62.5,56"
        fill="none"
        stroke={shade}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="47" cy="55" r="4" fill="#e57373" opacity="0.18" />
      <circle cx="73" cy="55" r="4" fill="#e57373" opacity="0.18" />
      <path
        d="M53,61.5 Q60,66.5 67,61.5 Q60,64 53,61.5 Z"
        fill="#b5524a"
        stroke="#b5524a"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d={front} fill={hair} />
    </svg>
  );
};

// A room behind a person on camera, filling the tile, drawn in a 200 × 110
// viewBox and cropped to the tile's aspect ratio. Keep the middle clear: the
// person sits there.
const Backdrop = ({ children }: { children: ReactNode }) => (
  <svg
    viewBox="0 0 200 110"
    preserveAspectRatio="xMidYMid slice"
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
  >
    {children}
  </svg>
);

const bookColors = [
  '#c0392b',
  '#2e86c1',
  '#f4d03f',
  '#27ae60',
  '#8e44ad',
  '#e67e22',
  '#16a085',
  '#d35400',
];

// Books standing on a shelf whose top is at y, from x to the right.
const Books = ({ x, y, seed }: { x: number; y: number; seed: number }) => {
  let left = x;
  return (
    <>
      {[0, 1, 2, 3, 4, 5, 6].map((book) => {
        const width = 3 + ((book + seed) % 3);
        const height = 13 + ((book * 5 + seed) % 7);
        const rect = (
          <rect
            key={book}
            x={left}
            y={y - height}
            width={width}
            height={height}
            rx="0.4"
            fill={bookColors[(book + seed) % bookColors.length]}
          />
        );
        left += width + 0.6;
        return rect;
      })}
    </>
  );
};

// The tutor's study: a sunny window with curtains and a full bookshelf.
const Study = () => (
  <Backdrop>
    <defs>
      <linearGradient id="study-wall" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f3e9dc" />
        <stop offset="1" stopColor="#e2d2bf" />
      </linearGradient>
      <linearGradient id="study-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#9fd0f0" />
        <stop offset="1" stopColor="#e3f2fb" />
      </linearGradient>
      <radialGradient id="study-light" cx="0.2" cy="0.3" r="0.6">
        <stop offset="0" stopColor="#fff8e1" stopOpacity="0.6" />
        <stop offset="1" stopColor="#fff8e1" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width="200" height="110" fill="url(#study-wall)" />
    <rect width="200" height="110" fill="url(#study-light)" />
    {/* Window with trees outside. */}
    <clipPath id="study-window">
      <rect x="12" y="12" width="44" height="58" />
    </clipPath>
    <rect x="12" y="12" width="44" height="58" fill="url(#study-sky)" />
    <g clipPath="url(#study-window)">
      <circle cx="22" cy="60" r="9" fill="#81c784" />
      <circle cx="36" cy="63" r="7" fill="#66bb6a" />
      <circle cx="50" cy="59" r="10" fill="#9ccc65" />
    </g>
    <path
      d="M12,12 H56 V70 H12 Z M34,12 V70 M12,41 H56"
      fill="none"
      stroke="#fafafa"
      strokeWidth="2.5"
    />
    <rect x="9" y="69" width="50" height="3" fill="#f5f5f5" />
    <path d="M5,6 H17 C15,30 17,60 13,90 H5 Z" fill="#e8b4a0" />
    <path d="M51,6 H63 V90 H55 C51,60 53,30 51,6 Z" fill="#e8b4a0" />
    <rect x="3" y="5" width="62" height="2" rx="1" fill="#8d6748" />
    {/* Bookshelf with a plant and a clock on top. */}
    <rect x="140" y="20" width="54" height="90" fill="#6d4c35" />
    <rect
      x="140"
      y="20"
      width="54"
      height="90"
      fill="none"
      stroke="#8d6748"
      strokeWidth="3"
    />
    <rect x="140" y="47" width="54" height="2.5" fill="#8d6748" />
    <rect x="140" y="75" width="54" height="2.5" fill="#8d6748" />
    <Books x={143} y={47} seed={0} />
    <Books x={145} y={75} seed={3} />
    <Books x={143} y={103} seed={5} />
    <rect x="178" y="31" width="12" height="16" rx="1" fill="#efe6d8" />
    <path d="M150,20 L148,12 H158 L156,20 Z" fill="#b5654a" />
    <path
      d="M153,12 C147,6 146,2 145,0 M153,12 C153,5 155,2 157,0 M153,12 C158,8 162,6 164,6"
      fill="none"
      stroke="#43a047"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <circle
      cx="178"
      cy="11"
      r="6"
      fill="#fafafa"
      stroke="#5d4037"
      strokeWidth="1.2"
    />
    <path d="M178,11 V7 M178,11 H181" stroke="#5d4037" strokeWidth="0.8" />
  </Backdrop>
);

// A student's living room at sunset: string lights, a poster, a plant and a
// window onto the city.
const LivingRoom = () => (
  <Backdrop>
    <defs>
      <linearGradient id="living-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#6c5ce7" />
        <stop offset="0.5" stopColor="#fd79a8" />
        <stop offset="1" stopColor="#fdcb6e" />
      </linearGradient>
      <radialGradient id="living-lamp" cx="0.15" cy="0.9" r="0.7">
        <stop offset="0" stopColor="#ffcc80" stopOpacity="0.45" />
        <stop offset="1" stopColor="#ffcc80" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width="200" height="110" fill="#4a5568" />
    <rect width="200" height="110" fill="url(#living-lamp)" />
    {/* Window onto the city. */}
    <rect x="138" y="14" width="52" height="66" fill="url(#living-sky)" />
    <circle cx="170" cy="58" r="8" fill="#ffeaa7" />
    <path
      d="M138,80 V54 H146 V46 H154 V60 H160 V40 H170 V64 H176 V50 H184 V58 H190 V80 Z"
      fill="#2d3436"
    />
    {[
      [149, 50],
      [149, 56],
      [163, 45],
      [163, 52],
      [166, 59],
      [179, 55],
      [179, 62],
      [142, 60],
    ].map(([x, y]) => (
      <rect key={`${x}-${y}`} x={x} y={y} width="2" height="2" fill="#ffd77a" />
    ))}
    <path
      d="M138,14 H190 V80 H138 Z M164,14 V80"
      fill="none"
      stroke="#2d3436"
      strokeWidth="2.5"
    />
    <rect x="134" y="79" width="60" height="3" fill="#2d3436" />
    {/* String lights. */}
    <path
      d="M0,6 Q50,22 100,8 Q150,22 200,6"
      fill="none"
      stroke="#2d3436"
      strokeWidth="0.6"
    />
    {[10, 24, 38, 52, 66, 80, 120, 134, 148, 162, 176, 190].map((x) => {
      // A point on the wire's quadratic curve, under the bulb.
      const [from, to] = x < 100 ? [6, 8] : [8, 6];
      const t = (x % 100) / 100;
      const y = from * (1 - t) ** 2 + 22 * 2 * t * (1 - t) + to * t ** 2;
      return (
        <g key={x}>
          <circle cx={x} cy={y + 2} r="3.5" fill="#ffe082" opacity="0.3" />
          <circle cx={x} cy={y + 2} r="1.4" fill="#fff3c4" />
        </g>
      );
    })}
    {/* Poster. */}
    <rect x="14" y="22" width="30" height="40" fill="#f5f0e6" />
    <circle cx="29" cy="38" r="9" fill="#e17055" />
    <path d="M17,58 L27,44 L33,52 L37,47 L41,58 Z" fill="#00897b" />
    {/* Plant. */}
    <path d="M18,110 L15,92 H33 L30,110 Z" fill="#d7ccc8" />
    <g fill="#4caf50">
      <ellipse cx="18" cy="82" rx="4" ry="10" transform="rotate(-30 18 82)" />
      <ellipse cx="24" cy="78" rx="4" ry="12" />
      <ellipse cx="31" cy="82" rx="4" ry="10" transform="rotate(30 31 82)" />
    </g>
  </Backdrop>
);

// A group video call with a tutor in Google Meet, to put inside a dark
// <ChromeWindow>: two students with the camera off, the tutor in front of a
// bookshelf and a student in a living room at sunset. Sized in em, from the
// window's font size.
export const VideoCall = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.8em',
      padding: '1em',
      background,
    }}
  >
    <div
      style={{
        flex: 1,
        minHeight: 0,
        display: 'grid',
        // minmax(0, …) keeps the rows equal whatever the tiles hold.
        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
        gridTemplateRows: 'repeat(2, minmax(0, 1fr))',
        gap: '0.8em',
      }}
    >
      <Tile name="Alex">
        <Avatar letter="A" color="#7e57c2" />
      </Tile>
      <Tile
        name="Maria"
        style={{
          alignItems: 'flex-end',
        }}
      >
        <Study />
        <Person
          shirt="#ef6c4a"
          hair="#5d3a24"
          skin="#f2c6a0"
          hairStyle="long"
          height="92%"
        />
      </Tile>
      <Tile name="Kenji" style={{ alignItems: 'flex-end' }}>
        <LivingRoom />
        <Person
          shirt="#26a69a"
          hair="#212121"
          skin="#e0b48c"
          hairStyle="short"
        />
      </Tile>
      <Tile name="Sofia">
        <Avatar letter="S" color="#1e88e5" />
      </Tile>
    </div>
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.8em',
      }}
    >
      <Button path={microphone} color={button} />
      <Button path={video} color={button} />
      <Button path={phoneHangUp} color={hangUp} />
    </div>
  </div>
);
