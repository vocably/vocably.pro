import type { CSSProperties, ReactNode } from 'react';
import { ChromeWindow } from './ChromeWindow';
import { Logo } from './Logo';
import { PageText } from './PageText';

type Props = {
  // The page text around the selected word: before, selection, after.
  text: [string, string, string];
  // The extension popup content, usually an <AnalysisItem>.
  children: ReactNode;
  style?: CSSProperties;
};

// macOS text selection blue.
const selection = 'rgba(0, 122, 255, 0.25)';

// A web page in desktop Chrome with a word selected and the extension's
// popup (extension-content-ui/src/components/popup) under it. Sized in cqmin,
// relative to the format, like the other mocks.
export const ChromeExtension = ({
  text: [before, word, after],
  children,
  style,
}: Props) => (
  <ChromeWindow url="www.example.com" title="Example" style={style}>
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2cqmin',
        padding: '4cqmin 6cqmin',
      }}
    >
      <PageText
        before={before}
        after={after}
        overflow={{ top: '0cqmin', bottom: '0cqmin' }}
        style={{ fontSize: '4.6cqmin' }}
      >
        <span style={{ background: selection }}>{word}</span>
      </PageText>
      <div
        style={{
          position: 'relative',
          width: '72cqmin',
          paddingTop: '7cqmin',
          paddingBottom: '2cqmin',
          borderRadius: '1.5cqmin',
          background: '#fff',
          boxShadow:
            '0 0.5cqmin 3cqmin rgba(0, 0, 0, 0.3), 0 0 0 0.1cqmin rgba(0, 0, 0, 0.08)',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Logo
          style={{
            position: 'absolute',
            top: '2cqmin',
            left: '2.5cqmin',
            height: '2.6cqmin',
            width: 'auto',
          }}
        />
        {/* vocably-icon-close */}
        <svg
          viewBox="0 0 24 24"
          fill="#bababa"
          style={{
            position: 'absolute',
            top: '1.5cqmin',
            right: '2cqmin',
            width: '3.4cqmin',
            height: '3.4cqmin',
          }}
        >
          <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
        </svg>
        {children}
      </div>
    </div>
  </ChromeWindow>
);
