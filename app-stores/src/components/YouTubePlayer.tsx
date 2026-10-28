import type { CSSProperties } from 'react';

type Props = {
  // The subtitle line: before, the clicked word, after.
  subtitle: [string, string, string];
  style?: CSSProperties;
};

// Material Design Icons for the player controls.
const play = 'M8,5.14V19.14L19,12.14L8,5.14Z';
const skipNext = 'M16,18H18V6H16M6,18L14.5,12L6,6V18Z';
const volume =
  'M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z';
const captions =
  'M18,11H16.5V10.5H14.5V13.5H16.5V13H18V14A1,1 0 0,1 17,15H14A1,1 0 0,1 13,14V10A1,1 0 0,1 14,9H17A1,1 0 0,1 18,10M11,11H9.5V10.5H7.5V13.5H9.5V13H11V14A1,1 0 0,1 10,15H7A1,1 0 0,1 6,14V10A1,1 0 0,1 7,9H10A1,1 0 0,1 11,10M19,4H5C3.89,4 3,4.89 3,6V18A2,2 0 0,0 5,20H19A2,2 0 0,0 21,18V6C21,4.89 20.1,4 19,4Z';
const settings =
  'M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z';
const fullscreen =
  'M5,5H10V7H7V10H5V5M14,5H19V10H17V7H14V5M17,14H19V19H14V17H17V14M10,17V19H5V14H7V17H10Z';

const Control = ({ path }: { path: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="#fff"
    style={{ display: 'block', width: '1.8em', height: '1.8em' }}
  >
    <path d={path} />
  </svg>
);

// Out-of-focus studio lights behind the speaker: x, y in %, size in em,
// color.
const lights: [number, number, number, string][] = [
  [8, 20, 5, 'rgba(255, 196, 120, 0.5)'],
  [22, 38, 3, 'rgba(255, 220, 160, 0.4)'],
  [76, 16, 6, 'rgba(120, 170, 255, 0.45)'],
  [90, 40, 4, 'rgba(160, 200, 255, 0.35)'],
  [64, 46, 2.5, 'rgba(255, 210, 150, 0.4)'],
  [36, 12, 2, 'rgba(200, 220, 255, 0.35)'],
];

// A YouTube video with subtitles on, paused on a speaker in a studio. The
// clicked word in the subtitle is underlined. Every size is in em, so the
// player scales with its `fontSize`, which defaults to 1.6cqmin.
export const YouTubePlayer = ({
  subtitle: [before, word, after],
  style,
}: Props) => (
  <div
    style={{
      position: 'relative',
      overflow: 'hidden',
      aspectRatio: '16 / 9',
      borderRadius: '0.9em',
      fontFamily: "'Roboto', sans-serif",
      fontSize: '1.6cqmin',
      color: '#fff',
      background: [
        ...lights.map(
          ([x, y, size, color]) =>
            `radial-gradient(circle ${size}em at ${x}% ${y}%, ${color}, transparent)`
        ),
        'radial-gradient(ellipse 60% 70% at 50% 40%, #31466f, transparent)',
        'linear-gradient(170deg, #1d2b4b, #0b1222 60%, #060912)',
      ].join(', '),
      boxShadow: '0 1.5em 4em rgba(15, 23, 42, 0.3)',
      ...style,
    }}
  >
    {/* The speaker: head and shoulders behind a desk. */}
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: '18%',
        width: '9em',
        height: '11em',
        marginLeft: '-4.5em',
        borderRadius: '50%',
        background: 'radial-gradient(circle at 45% 35%, #c99a7c, #8a5f48)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: '50%',
        bottom: '-10%',
        width: '30em',
        height: '18em',
        marginLeft: '-15em',
        borderRadius: '45% 45% 0 0',
        background: 'linear-gradient(#2a3550, #141b2c)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '24%',
        background: 'linear-gradient(#3a2d26, #1d1612)',
      }}
    />
    {/* The controls' shade. */}
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '40%',
        background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.75))',
      }}
    />
    <div
      style={{
        position: 'absolute',
        left: '10%',
        right: '10%',
        bottom: '5.2em',
        textAlign: 'center',
        fontSize: '1.5em',
        lineHeight: 1.45,
      }}
    >
      <span
        style={{
          padding: '0.1em 0.3em',
          background: 'rgba(8, 8, 8, 0.75)',
          boxDecorationBreak: 'clone',
          WebkitBoxDecorationBreak: 'clone',
        }}
      >
        {before}
        <span
          style={{
            textDecoration: 'underline',
            textUnderlineOffset: '0.15em',
          }}
        >
          {word}
        </span>
        {after}
      </span>
    </div>
    {/* The progress bar. */}
    <div
      style={{
        position: 'absolute',
        left: '1.2em',
        right: '1.2em',
        bottom: '3.6em',
        height: '0.25em',
        background: 'rgba(255, 255, 255, 0.3)',
      }}
    >
      <div style={{ width: '48%', height: '100%', background: '#f00' }} />
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '48%',
          width: '0.9em',
          height: '0.9em',
          margin: '-0.45em',
          borderRadius: '50%',
          background: '#f00',
        }}
      />
    </div>
    <div
      style={{
        position: 'absolute',
        left: '1.2em',
        right: '1.2em',
        bottom: '0.8em',
        display: 'flex',
        alignItems: 'center',
        gap: '1.2em',
      }}
    >
      <Control path={play} />
      <Control path={skipNext} />
      <Control path={volume} />
      <span style={{ fontSize: '0.95em' }}>1:52 / 3:57</span>
      <span style={{ flex: 1 }} />
      <div style={{ borderBottom: '0.2em solid #f00' }}>
        <Control path={captions} />
      </div>
      <Control path={settings} />
      <Control path={fullscreen} />
    </div>
  </div>
);
