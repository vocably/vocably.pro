import type { CSSProperties } from 'react';
import type { AnalysisItem } from '@vocably/model';
import type { Language } from '../languages';
import { Arrow } from './Arrow';
import { CardFront } from './CardFront';
import { background, onBackground, primary } from './mobileTheme';

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
  const answers = [...incorrect];
  answers.splice(correctIndex, 0, item.translation);
  if (hideLastAnswer) answers.pop();

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
      <CardFront item={item} language={language} hideExamples={hideExamples} />

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
