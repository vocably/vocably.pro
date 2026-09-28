import type { CSSProperties } from 'react';
import type { AnalysisItem } from '@vocably/model';
import { languageTranslations } from '@vocably/i18n';
import type { Language } from '../languages';

// Colors of the mobile app's light theme (mobile-app/src/ThemeProvider.tsx).
const primary = 'rgb(0, 80, 255)';
const secondary = 'rgb(0, 0, 0)';
const onBackground = 'rgb(64, 64, 64)';
const background = 'rgb(255, 255, 255)';

type Props = {
  // The card being studied.
  item: AnalysisItem;
  // Three wrong translations shown next to `item.translation`.
  incorrect: [string, string, string];
  // The interface language, which the part of speech is written in.
  language: Language;
  // Leaves the examples out, for formats with little room.
  hideExamples?: boolean;
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
  style,
}: Props) => {
  // Falls back to the untranslated value, like the mobile app does.
  const partOfSpeech =
    item.partOfSpeech &&
    (languageTranslations[language][item.partOfSpeech] ?? item.partOfSpeech);
  const answers = [...incorrect];
  answers.splice(correctIndex, 0, item.translation);
  const examples = hideExamples ? [] : (item.examples ?? []);

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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
        {/* PlaySound, Material "play-circle". */}
        <svg
          viewBox="0 0 24 24"
          fill={onBackground}
          style={{ display: 'block', width: '1.5em', height: '1.5em' }}
        >
          <path d="M10,16.5V7.5L16,12M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
        </svg>
        <span style={{ fontSize: '2em', color: secondary }}>{item.source}</span>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5em',
          marginLeft: '0.5em',
          marginTop: '0.375em',
        }}
      >
        {item.ipa && <span>/{item.ipa.replace(/[/[\]]/g, '')}/</span>}
        {item.g && <span>({item.g})</span>}
        {partOfSpeech && <span>{partOfSpeech}</span>}
        {item.number === 'singular' &&
          item.pluralForm &&
          item.pluralForm !== 'n/a' && <span>(plural: {item.pluralForm})</span>}
      </div>

      {examples.length > 0 && (
        <div
          style={{
            marginTop: '0.75em',
            marginLeft: '0.5em',
            fontSize: '1.125em',
          }}
        >
          {examples.map((example, index) => (
            <div key={index}>
              {examples.length > 1 && '• '}
              {example}
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
        {answers.map((answer, index) => (
          <div
            key={index}
            style={{
              // The 2px ring the app shows around the answer it reveals.
              padding: '0.125em',
            }}
          >
            <div
              style={{
                padding: '0.75em 0.5em',
                border: `0.0625em solid ${primary}`,
                borderRadius: '1em',
                background,
                color: primary,
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: '1.125em' }}>{answer}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
