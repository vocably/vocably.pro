import type { CSSProperties, ReactNode } from 'react';

type Props = {
  // The small line above each store name, e.g. "Download on the".
  appStore: string;
  googlePlay: string;
  style?: CSSProperties;
};

// Material Design Icons "apple".
const apple =
  'M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z';

// The Google Play triangle, split into its four colors.
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" style={{ display: 'block', width: '2em' }}>
    <path d="M3,2L13.2,12L3,22Z" fill="#4285f4" />
    <path d="M3,2L16.6,9.6L13.2,12Z" fill="#34a853" />
    <path d="M16.6,9.6L21,12L16.6,14.4L13.2,12Z" fill="#fbbc04" />
    <path d="M13.2,12L16.6,14.4L3,22Z" fill="#ea4335" />
  </svg>
);

const Badge = ({
  icon,
  line,
  name,
}: {
  icon: ReactNode;
  line: string;
  name: string;
}) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.6em',
      padding: '0.55em 1.1em 0.6em 0.8em',
      borderRadius: '0.6em',
      border: '0.06em solid #a6a6a6',
      background: '#000',
      color: '#fff',
      whiteSpace: 'nowrap',
    }}
  >
    {icon}
    <div style={{ lineHeight: 1.05 }}>
      <div style={{ fontSize: '0.75em' }}>{line}</div>
      <div style={{ fontSize: '1.55em', fontWeight: 500 }}>{name}</div>
    </div>
  </div>
);

// The App Store and Google Play download badges, side by side. Sized in em.
export const StoreBadges = ({ appStore, googlePlay, style }: Props) => (
  <div
    style={{
      display: 'flex',
      gap: '0.8em',
      fontFamily: "'Roboto', sans-serif",
      fontSize: '2cqmin',
      ...style,
    }}
  >
    <Badge
      icon={
        <svg
          viewBox="0 0 24 24"
          fill="#fff"
          style={{ display: 'block', width: '2.2em' }}
        >
          <path d={apple} />
        </svg>
      }
      line={appStore}
      name="App Store"
    />
    <Badge icon={<PlayIcon />} line={googlePlay} name="Google Play" />
  </div>
);
