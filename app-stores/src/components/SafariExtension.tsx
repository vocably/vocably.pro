import type { CSSProperties, ReactNode } from 'react';
import { Logo } from './Logo';
import { PageText } from './PageText';

type Props = {
  // The page text around the selected word: before, selection, after.
  text: [string, string, string];
  // The extension popup content, usually an <AnalysisItem>.
  children: ReactNode;
  style?: CSSProperties;
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

// A web page in iOS Safari with a word selected and the extension's popup
// (extension-content-ui/src/components/popup) under it. Sized in cqmin,
// relative to the format, like the other mocks.
export const SafariExtension = ({
  text: [before, word, after],
  children,
  style,
}: Props) => (
  <div
    style={{
      width: '90%',
      fontFamily: "'Roboto', sans-serif",
      ...style,
    }}
  >
    <div
      style={{
        position: 'relative',
        marginBottom: '4cqmin',
        paddingTop: '16cqmin',
        paddingBottom: '6cqmin',
        borderRadius: '5cqmin',
        background: '#fff',
        // Layered like the device frames' shadow: a hairline edge, a tight
        // contact shadow, a key shadow and a wide ambient one.
        boxShadow: [
          '0 0 0 0.1cqmin rgba(15, 20, 30, 0.06)',
          '0 0.3cqmin 0.6cqmin rgba(15, 20, 30, 0.12)',
          '0 1.6cqmin 3cqmin rgba(15, 20, 30, 0.12)',
          '0 6cqmin 9cqmin rgba(15, 20, 30, 0.12)',
        ].join(', '),
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Logo
        style={{
          position: 'absolute',
          top: '4cqmin',
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
          top: '3.5cqmin',
          right: '3cqmin',
          width: '5cqmin',
          height: '5cqmin',
        }}
      >
        <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
      </svg>
      {children}
    </div>
    <PageText
      before={before}
      after={after}
      overflow={{ top: '2cqmin', bottom: '2cqmin' }}
    >
      <span style={{ position: 'relative', background: selection }}>
        <Handle side="start" />
        {word}
        <Handle side="end" />
      </span>
    </PageText>
  </div>
);
