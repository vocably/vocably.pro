import type { CSSProperties, ReactNode } from 'react';

type Props = {
  // The small line above each store name, e.g. "Download on the".
  appStore: string;
  googlePlay: string;
  style?: CSSProperties;
};

// The proportions follow the official badges, in units of the badge height:
// Apple's "Download on the App Store" (119.66 × 40) and Google's
// "Get it on Google Play" (180 × 53.33), as in packages/www/src/assets.

// The Apple logo from the App Store badge, in its 40-high coordinates.
const AppleIcon = () => (
  <svg
    viewBox="9.97 8.72 17.72 21.78"
    fill="#fff"
    style={{ display: 'block', height: '0.545em' }}
  >
    <path d="M24.76888,20.30068a4.94881,4.94881,0,0,1,2.35656-4.15206,5.06566,5.06566,0,0,0-3.99116-2.15768c-1.67924-.17626-3.30719,1.00483-4.1629,1.00483-.87227,0-2.18977-.98733-3.6085-.95814a5.31529,5.31529,0,0,0-4.47292,2.72787c-1.934,3.34842-.49141,8.26947,1.3612,10.97608.9269,1.32535,2.01018,2.8058,3.42763,2.7533,1.38706-.05753,1.9051-.88448,3.5794-.88448,1.65876,0,2.14479.88448,3.591.8511,1.48838-.02416,2.42613-1.33124,3.32051-2.66914a10.962,10.962,0,0,0,1.51842-3.09251A4.78205,4.78205,0,0,1,24.76888,20.30068Z" />
    <path d="M22.037 12.211a4.872 4.872 0 0 0 1.115-3.491 4.957 4.957 0 0 0-3.208 1.66 4.636 4.636 0 0 0-1.144 3.361 4.099 4.099 0 0 0 3.237-1.53Z" />
  </svg>
);

// The Google Play logo from the Google Play badge, in its 53.33-high
// coordinates, in the current Google brand colors.
const PlayIcon = () => (
  <svg
    viewBox="13.29 9.52 30.69 34.29"
    style={{ display: 'block', height: '0.643em' }}
  >
    <path
      d="m27.622 25.899-14.194 15.066c.001.003.002.006.002.009.435 1.636 1.93 2.841 3.703 2.841.709 0 1.375-.192 1.945-.528l.045-.027 15.978-9.22-7.479-8.141Z"
      fill="#ea4335"
    />
    <path
      d="m41.983 23.334-.014-.009-6.898-3.999-7.772 6.916 7.799 7.798 6.862-3.959c1.203-.649 2.02-1.918 2.02-3.38 0-1.452-.806-2.714-1.997-3.367Z"
      fill="#fbbc04"
    />
    <path
      d="M13.426 12.37c-.085.315-.13.644-.13.987v26.623c0 .342.044.672.131.986l14.684-14.681-14.685-13.915Z"
      fill="#4285f4"
    />
    <path
      d="m27.727 26.668 7.347-7.345-15.96-9.253a3.853 3.853 0 0 0-1.982-.548c-1.773 0-3.27 1.207-3.705 2.845v.004l14.3 14.297Z"
      fill="#34a853"
    />
  </svg>
);

const Badge = ({
  icon,
  line,
  name,
  radius,
  padding,
  gap,
  lineStyle,
  nameStyle,
}: {
  icon: ReactNode;
  line: string;
  name: string;
  radius: string;
  padding: string;
  gap: string;
  lineStyle: CSSProperties;
  nameStyle: CSSProperties;
}) => (
  <div
    style={{
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      gap,
      height: '1em',
      padding,
      borderRadius: radius,
      border: '0.025em solid #a6a6a6',
      background: '#000',
      color: '#fff',
      whiteSpace: 'nowrap',
    }}
  >
    {icon}
    <div style={{ lineHeight: 1 }}>
      <div style={lineStyle}>{line}</div>
      <div style={nameStyle}>{name}</div>
    </div>
  </div>
);

// The App Store and Google Play download badges, side by side, both as tall
// as the font size.
export const StoreBadges = ({ appStore, googlePlay, style }: Props) => (
  <div
    style={{
      display: 'flex',
      gap: '0.22em',
      fontSize: '7.2cqmin',
      ...style,
    }}
  >
    <Badge
      icon={<AppleIcon />}
      line={appStore}
      name="App Store"
      radius="0.18em"
      padding="0 0.3em 0 0.25em"
      gap="0.14em"
      lineStyle={{
        fontFamily:
          "-apple-system, 'SF Pro Text', 'Helvetica Neue', sans-serif",
        fontSize: '0.2em',
        fontWeight: 500,
        letterSpacing: '0.01em',
      }}
      nameStyle={{
        fontFamily:
          "-apple-system, 'SF Pro Display', 'Helvetica Neue', sans-serif",
        fontSize: '0.45em',
        fontWeight: 500,
        letterSpacing: '-0.02em',
        marginTop: '0.02em',
      }}
    />
    <Badge
      icon={<PlayIcon />}
      line={googlePlay}
      name="Google Play"
      radius="0.125em"
      padding="0 0.3em 0 0.24em"
      gap="0.21em"
      lineStyle={{
        fontFamily: "'Roboto', sans-serif",
        fontSize: '0.17em',
        fontWeight: 500,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}
      nameStyle={{
        fontFamily: "'Google Sans', 'Product Sans', 'Roboto', sans-serif",
        fontSize: '0.42em',
        fontWeight: 500,
        letterSpacing: '-0.01em',
        marginTop: '0.03em',
      }}
    />
  </div>
);
