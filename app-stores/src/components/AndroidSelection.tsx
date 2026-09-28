import type { CSSProperties } from 'react';
import { PageText } from './PageText';

type Props = {
  // The page text around the selected word: before, selection, after.
  text: [string, string, string];
  // The first item of the text selection menu, Android's "Web search".
  webSearch: string;
  style?: CSSProperties;
};

// Android text selection colors.
const handleColor = '#1a73e8';
const selection = 'rgba(26, 115, 232, 0.3)';
const handleSize = 6;

// An Android selection handle: a drop hanging under the selection, with its
// square corner pointing at the start or the end of the selected text.
const Handle = ({ side }: { side: 'start' | 'end' }) => (
  <span
    style={{
      position: 'absolute',
      top: '100%',
      [side === 'start' ? 'right' : 'left']: '100%',
      width: `${handleSize}cqmin`,
      height: `${handleSize}cqmin`,
      borderRadius: side === 'start' ? '50% 0 50% 50%' : '0 50% 50% 50%',
      background: handleColor,
    }}
  />
);

const menuItem: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  height: '15cqmin',
  padding: '0 6cqmin',
};

// A web page in an Android browser with a word selected and the system text
// selection menu, opened to its overflow panel, above it. Sized in cqmin,
// relative to the format, like the other mocks.
export const AndroidSelection = ({
  text: [before, word, after],
  webSearch,
  style,
}: Props) => (
  <div
    style={{
      width: '90%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6cqmin',
      ...style,
    }}
  >
    <div
      style={{
        minWidth: '65cqmin',
        padding: '2cqmin 0',
        borderRadius: '8cqmin',
        background: '#fff',
        boxShadow: '0 1cqmin 2cqmin rgba(0, 0, 0, 0.35)',
        fontFamily: "'Roboto', sans-serif",
        fontSize: '5.4cqmin',
        color: '#1f1f1f',
        width: '90%',
      }}
    >
      <div style={menuItem}>{webSearch}</div>
      {/* Material's pressed state, as if the item was just tapped. */}
      <div style={{ ...menuItem, background: 'rgba(31, 31, 31, 0.1)' }}>
        Translate with Vocably
      </div>
      <div style={menuItem}>
        {/* Material arrow_back */}
        <svg
          viewBox="0 0 24 24"
          fill="#444746"
          style={{ width: '7cqmin', height: '7cqmin' }}
        >
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
      </div>
    </div>
    <PageText
      before={before}
      after={after}
      overflow={{ top: '0cqmin', bottom: `${handleSize + 1}cqmin` }}
      style={{
        width: 'max-content',
        fontSize: '5.5cqmin',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ position: 'relative', background: selection }}>
        <Handle side="start" />
        {word}
        <Handle side="end" />
      </span>
    </PageText>
  </div>
);
