import type { CSSProperties, ReactNode } from 'react';
import { Logo } from './Logo';

type Props = {
  // The address bar text, without the scheme.
  url: string;
  // The tab title.
  title: string;
  // The page content.
  children: ReactNode;
  style?: CSSProperties;
};

// Colors of Chrome's light theme on macOS.
const frame = '#dee1e6';
const toolbar = '#ffffff';
const omnibox = '#f1f3f4';
const icon = '#5f6368';

const Dot = ({ color }: { color: string }) => (
  <span
    style={{
      width: '0.75em',
      height: '0.75em',
      borderRadius: '50%',
      background: color,
    }}
  />
);

// Material "arrow-left", "arrow-right" and "refresh".
const navigation = [
  'M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z',
  'M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z',
  'M17.65,6.35C16.2,4.9 14.21,4 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20C15.73,20 18.84,17.45 19.73,14H17.65C16.83,16.33 14.61,18 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6C13.66,6 15.14,6.69 16.22,7.78L13,11H20V4L17.65,6.35Z',
];

// A desktop Chrome window: the tab strip, the toolbar with the address bar
// and the Vocably extension icon, and the page under them. Every size is in
// em, so the window scales with its `fontSize`, which defaults to 2cqmin.
export const ChromeWindow = ({ url, title, children, style }: Props) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: "'Roboto', sans-serif",
      fontSize: '2cqmin',
      borderRadius: '0.75em',
      background: toolbar,
      boxShadow:
        '0 1.5em 4em rgba(15, 23, 42, 0.25), 0 0 0 0.06em rgba(15, 23, 42, 0.12)',
      ...style,
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '1.5em',
        padding: '0.6em 0.9em 0',
        background: frame,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '0.5em',
          alignSelf: 'center',
          paddingBottom: '0.3em',
        }}
      >
        <Dot color="#ff5f57" />
        <Dot color="#febc2e" />
        <Dot color="#28c840" />
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6em',
          width: '15em',
          padding: '0.55em 0.9em',
          borderRadius: '0.6em 0.6em 0 0',
          background: toolbar,
          color: '#1f1f1f',
          fontSize: '0.9em',
          whiteSpace: 'nowrap',
        }}
      >
        <span
          style={{
            width: '1em',
            height: '1em',
            flexShrink: 0,
            borderRadius: '50%',
            background: '#9aa0a6',
          }}
        />
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </span>
      </div>
    </div>
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1em',
        padding: '0.5em 0.9em',
        borderBottom: `0.06em solid ${frame}`,
      }}
    >
      {navigation.map((path) => (
        <svg
          key={path}
          viewBox="0 0 24 24"
          fill={icon}
          style={{ display: 'block', width: '1.3em', height: '1.3em' }}
        >
          <path d={path} />
        </svg>
      ))}
      <div
        style={{
          flex: 1,
          padding: '0.45em 1em',
          borderRadius: '1em',
          background: omnibox,
          color: '#1f1f1f',
          fontSize: '0.9em',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {url}
      </div>
      {/* The extension's toolbar icon: the logo cropped to its mark. */}
      <div style={{ width: '1.3em', height: '1.3em', overflow: 'hidden' }}>
        <Logo style={{ display: 'block', height: '100%', width: 'auto' }} />
      </div>
    </div>
    <div style={{ position: 'relative', flex: 1 }}>{children}</div>
  </div>
);
