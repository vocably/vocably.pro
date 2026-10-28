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

// A video call with a tutor in Google Meet, to put inside a dark
// <ChromeWindow>: the student with the camera off and the tutor in front of
// a bookshelf. Sized in em, from the window's font size.
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
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.8em',
      }}
    >
      <Tile name="Alex">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '5em',
            height: '5em',
            borderRadius: '50%',
            background: '#7e57c2',
            color: '#fff',
            fontSize: '1.6em',
          }}
        >
          A
        </div>
      </Tile>
      <Tile
        name="Maria"
        style={{
          alignItems: 'flex-end',
          background: 'linear-gradient(90deg, #c9d6e6 0 30%, #e8edf3 30% 100%)',
        }}
      >
        {/* A bookshelf behind the tutor. */}
        <div
          style={{
            position: 'absolute',
            top: '18%',
            right: '8%',
            width: '30%',
            height: '0.4em',
            background: '#b08a66',
            boxShadow: '0 4em 0 #b08a66',
          }}
        />
        {[0, 1, 2, 3].map((book) => (
          <div
            key={book}
            style={{
              position: 'absolute',
              top: `calc(18% - ${2 + (book % 2) * 0.6}em)`,
              right: `${10 + book * 6}%`,
              width: '1em',
              height: `${2 + (book % 2) * 0.6}em`,
              background: ['#e57373', '#64b5f6', '#ffd54f', '#81c784'][book],
            }}
          />
        ))}
        {/* The tutor: shoulders, head and hair. */}
        <div style={{ position: 'relative', width: '12em', height: '11em' }}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: '4.5em',
              borderRadius: '6em 6em 0 0',
              background: '#ef6c4a',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '3.4em',
              top: '0.6em',
              width: '5.2em',
              height: '6.4em',
              borderRadius: '50% 50% 45% 45%',
              background: '#5d3a24',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: '3.9em',
              top: '1.6em',
              width: '4.2em',
              height: '5em',
              borderRadius: '50%',
              background: '#f2c6a0',
            }}
          />
        </div>
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
