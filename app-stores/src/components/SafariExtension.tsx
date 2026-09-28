import type { ReactNode } from 'react';
import { Logo } from './Logo';

type Props = {
  // The page text around the selected word: before, selection, after.
  text: [string, string, string];
  // The extension popup content, usually an <AnalysisItem>.
  children: ReactNode;
};

// iOS text selection blue.
const selection = 'rgba(0, 122, 255, 0.25)';
const handleColor = '#007aff';
const handleWidth = 0.6;
const knobSize = 2.4;

// An iOS selection handle: a vertical bar on the edge of the selection with a
// knob on top of the start handle and under the end handle.
const Handle = ({ side }: { side: 'start' | 'end' }) => (
  <span
    style={{
      position: 'absolute',
      top: 0,
      bottom: 0,
      [side === 'start' ? 'left' : 'right']: `-${handleWidth / 2}cqmin`,
      width: `${handleWidth}cqmin`,
      background: handleColor,
    }}
  >
    <span
      style={{
        position: 'absolute',
        left: '50%',
        [side === 'start' ? 'bottom' : 'top']: '100%',
        width: `${knobSize}cqmin`,
        height: `${knobSize}cqmin`,
        marginLeft: `-${knobSize / 2}cqmin`,
        [side === 'start' ? 'marginBottom' : 'marginTop']:
          `-${knobSize / 4}cqmin`,
        borderRadius: '50%',
        background: handleColor,
      }}
    />
  </span>
);

// Fades the page text in on the left and out on the right, so the excerpt
// reads as part of a longer sentence.
const fade =
  'linear-gradient(to right, transparent, #000 25%, #000 75%, transparent)';

// A web page in iOS Safari with a word selected and the extension's popup
// (extension-content-ui/src/components/popup) under it. Sized in cqmin,
// relative to the format, like the other mocks.
export const SafariExtension = ({
  text: [before, word, after],
  children,
}: Props) => (
  <div
    style={{
      width: '90%',
      fontFamily: "'Roboto', sans-serif",
    }}
  >
    <div
      style={{
        position: 'relative',
        marginBottom: '4cqmin',
        paddingTop: '14cqmin',
        paddingBottom: '4cqmin',
        borderRadius: '3cqmin',
        background: '#fff',
        boxShadow: '0 1cqmin 4cqmin rgba(0, 0, 0, 0.45)',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Logo
        style={{
          position: 'absolute',
          top: '3cqmin',
          left: '4cqmin',
          height: '4cqmin',
          width: 'auto',
        }}
      />
      {/* vocably-icon-close */}
      <svg
        viewBox="0 0 24 24"
        fill="#bababa"
        style={{
          position: 'absolute',
          top: '2.5cqmin',
          right: '3cqmin',
          width: '5cqmin',
          height: '5cqmin',
        }}
      >
        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
      </svg>
      {children}
    </div>
    <div
      style={{
        fontFamily: "'Merriweather', serif",
        fontSize: '5cqmin',
        lineHeight: 1.7,
        color: '#333',
        textAlign: 'center',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          // The mask clips to the border box, so leave room for the handle
          // knobs above and below the line without changing the layout.
          padding: '2cqmin 0',
          margin: '-2cqmin 0',
          maskImage: fade,
          WebkitMaskImage: fade,
        }}
      >
        {before}
        <span style={{ position: 'relative', background: selection }}>
          <Handle side="start" />
          {word}
          <Handle side="end" />
        </span>
        {after}
      </span>
    </div>
  </div>
);
