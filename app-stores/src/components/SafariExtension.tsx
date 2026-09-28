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
      }}
    >
      <span
        style={{
          display: 'inline-block',
          maskImage: fade,
          WebkitMaskImage: fade,
        }}
      >
        {before}
        <span
          style={{
            background: selection,
            borderLeft: '0.3cqmin solid #007aff',
            borderRight: '0.3cqmin solid #007aff',
          }}
        >
          {word}
        </span>
        {after}
      </span>
    </div>
  </div>
);
