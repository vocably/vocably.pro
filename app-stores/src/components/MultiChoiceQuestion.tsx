import type { CSSProperties } from 'react';
import type { AnalysisItem } from '@vocably/model';
import { languageTranslations } from '@vocably/i18n';
import type { Language } from '../languages';
import { Arrow } from './Arrow';

// Colors of the mobile app's light theme (mobile-app/src/ThemeProvider.tsx).
const primary = 'rgb(0, 80, 255)';
const secondary = 'rgb(0, 0, 0)';
const onBackground = 'rgb(106, 106, 106)';
const background = 'rgb(255, 255, 255)';
// React Native Paper's MD3 light onSurfaceVariant, for muted text.
const muted = 'rgb(73, 69, 79)';
const inputBg = 'rgba(106, 106, 106, 0.1)';

// Material "play-circle", as PlaySound draws it.
const PlayIcon = ({ size, opacity }: { size: string; opacity: number }) => (
  <svg
    viewBox="0 0 24 24"
    fill={onBackground}
    style={{
      display: 'inline-block',
      width: size,
      height: size,
      flexShrink: 0,
      opacity,
    }}
  >
    <path d="M10,16.5V7.5L16,12M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
  </svg>
);

// mobile-app/src/Tag.tsx
const Tag = ({ children }: { children: string }) => (
  <span
    style={{
      padding: '0.125em 0.625em 0.25em',
      borderRadius: '0.75em',
      background: inputBg,
      fontSize: '0.8125em',
      fontWeight: 500,
      letterSpacing: '0.0231em',
      lineHeight: '1.2308em',
      color: muted,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </span>
);

type Props = {
  // The card being studied.
  item: AnalysisItem;
  // Three wrong translations shown next to `item.translation`.
  incorrect: [string, string, string];
  // The interface language, which the part of speech is written in.
  language: Language;
  // Leaves the examples out, for formats with little room.
  hideExamples?: boolean;
  // Leaves the last answer out, for when the four don't fit.
  hideLastAnswer?: boolean;
  // Fills the correct answer and points a mouse cursor at it, as if it had
  // just been clicked.
  answered?: boolean;
  // Merged over the root styles, so it can override them.
  style?: CSSProperties;
};

// Where the correct answer goes among the four. The app shuffles them; a
// fixed spot keeps the screenshots the same between exports.
const correctIndex = 1;

// A static copy of the mobile app's multi-choice study card, front direction
// (mobile-app/src/study/MultiChoice.tsx with study/Card/CardFront.tsx).
// Every size is in em, where 1em stands for the app's 16px.
export const MultiChoiceQuestion = ({
  item,
  incorrect,
  language,
  hideExamples = false,
  hideLastAnswer = false,
  answered = false,
  style,
}: Props) => {
  // Falls back to the untranslated value, like the mobile app does.
  const partOfSpeech =
    item.partOfSpeech &&
    (languageTranslations[language][item.partOfSpeech] ?? item.partOfSpeech);
  const answers = [...incorrect];
  answers.splice(correctIndex, 0, item.translation);
  if (hideLastAnswer) answers.pop();
  const examples = hideExamples ? [] : (item.examples ?? []);

  const tags = [partOfSpeech, item.g].filter(Boolean) as string[];

  return (
    <div
      style={{
        width: '100%',
        fontFamily: "'Roboto', sans-serif",
        fontSize: '4.5cqmin',
        lineHeight: 1.25,
        color: onBackground,
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25em' }}>
        <PlayIcon size="1.5em" opacity={0.5} />
        <span
          style={{
            fontSize: '2.125em',
            fontWeight: 600,
            letterSpacing: '-0.0088em',
            color: secondary,
          }}
        >
          {item.source}
        </span>
      </div>

      {(item.ipa || tags.length > 0) && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.5em',
            marginTop: '0.225em',
          }}
        >
          {item.ipa && (
            <span style={{ color: muted }}>
              /{item.ipa.replace(/[/[\]]/g, '')}/
            </span>
          )}
          {tags.map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </div>
      )}

      {examples.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.375em',
            marginTop: '1.25em',
            fontSize: '1.125em',
          }}
        >
          {examples.map((example, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.25em',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '1.3em',
                }}
              >
                <PlayIcon size="1em" opacity={0.2} />
              </span>
              <span>{example}</span>
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25em',
          marginTop: '2em',
        }}
      >
        {answers.map((answer, index) => {
          const chosen = answered && index === correctIndex;
          return (
            <div
              key={index}
              style={{
                // The 2px ring the app shows around the answer it reveals.
                padding: '0.125em',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  padding: '0.75em 0.5em',
                  border: `0.0625em solid ${primary}`,
                  borderRadius: '1em',
                  background: chosen ? primary : background,
                  color: chosen ? background : primary,
                  textAlign: 'center',
                }}
              >
                {/* Two equal halves of the room the text leaves keep it
                    centered; the pointer goes in the right one. */}
                <span style={{ flex: '1 1 0' }} />
                <span style={{ fontSize: '1.125em' }}>{answer}</span>
                <span
                  style={{
                    flex: '1 1 0',
                    position: 'relative',
                    fontSize: '1.125em',
                  }}
                >
                  {chosen && (
                    // A mouse pointer just past the end of the text, so it
                    // stays clear of answers of any length, but moved back
                    // when the text is too long for it to fit in the
                    // button. Its tip is 0.33em into its box.
                    <Arrow
                      direction="up-left"
                      style={{
                        position: 'absolute',
                        left: 'min(2em, calc(100% - 1em))',
                        top: '60%',
                        width: '2.6em',
                      }}
                    />
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
