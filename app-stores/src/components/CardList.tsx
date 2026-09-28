import type { CSSProperties } from 'react';

// Colors of the mobile app's light theme (mobile-app/src/ThemeProvider.tsx).
const primary = 'rgb(0, 80, 255)';
const secondary = 'rgb(0, 0, 0)';
const onBackground = 'rgb(106, 106, 106)';
const outline = 'rgb(230, 230, 230)';

type Props = {
  // What the user asked for, shown as their chat message.
  prompt: string;
  // The generated cards: the word and its translation.
  cards: readonly (readonly [string, string])[];
  // Merged over the root styles, so it can override them.
  style?: CSSProperties;
};

// A user's chat message asking for a list of cards, followed by the cards it
// generated. The list runs past the bottom of the canvas and fades out there.
// Every size is in em, where 1em stands for the app's 16px.
export const CardList = ({ prompt, cards, style }: Props) => (
  <>
    <div
      style={{
        width: '90%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5em',
        fontFamily: "'Roboto', sans-serif",
        fontSize: '5.5cqmin',
        lineHeight: 1.25,
        color: onBackground,
        ...style,
      }}
    >
      <div
        style={{
          alignSelf: 'flex-end',
          whiteSpace: 'nowrap',
          padding: '0.6em 1.1em',
          borderRadius: '1.25em 1.25em 0.3em 1.25em',
          background: primary,
          boxShadow: '0 0.4em 1.2em rgba(0, 80, 255, 0.3)',
          color: '#fff',
        }}
      >
        {prompt}
      </div>
      <div>
        {cards.map(([word, translation], index) => (
          <div
            key={word}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1em',
              padding: '0.6em 0',
              borderTop: index === 0 ? 'none' : `0.06em solid ${outline}`,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: secondary, fontWeight: 'bold' }}>{word}</div>
              <div style={{ fontStyle: 'italic' }}>{translation}</div>
            </div>
            {/* Material Design Icons "plus-circle-outline". */}
            <svg
              viewBox="0 0 24 24"
              fill={primary}
              style={{
                display: 'block',
                flexShrink: 0,
                width: '1.5em',
                height: '1.5em',
              }}
            >
              <path d="M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M13,7H11V11H7V13H11V17H13V13H17V11H13V7Z" />
            </svg>
          </div>
        ))}
      </div>
    </div>
    {/* Positioned against the canvas (the template), not the list, so the
        fade always ends at the canvas's bottom edge. */}
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: '35%',
        background: 'linear-gradient(rgba(255, 255, 255, 0), #fff 85%)',
        pointerEvents: 'none',
      }}
    />
  </>
);
