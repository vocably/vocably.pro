import type { CSSProperties } from 'react';
import type { AnalysisItem } from '@vocably/model';
import type { Language } from '../languages';
import { CardFront } from './CardFront';
import { background, onBackground, primary, primarySoft } from './mobileTheme';

// Material Design Icons "close", "check" and "check-all", one per grade.
const icons = [
  'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z',
  'M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z',
  'M0.41,13.41L6,19L7.41,17.58L1.83,12M22.24,5.58L11.66,16.17L7.5,12L6.07,13.41L11.66,19L23.66,7M18,7L16.59,5.58L10.24,11.93L11.66,13.34L18,7Z',
];

// The outer corners of the row are round, the inner ones nearly square.
const big = '1em';
const small = '0.25em';
const radii = [
  `${big} ${small} ${small} ${big}`,
  small,
  `${small} ${big} ${big} ${small}`,
];

type Props = {
  // The card being studied.
  item: AnalysisItem;
  // The interface language, which the part of speech is written in.
  language: Language;
  // The labels of the grade buttons: not yet, almost, got it.
  grades: [string, string, string];
  // A note right above the grade buttons.
  hint?: string;
  // Leaves the examples out, for formats with little room.
  hideExamples?: boolean;
  // Fills the button of this grade, as if it had just been tapped.
  selected?: 0 | 1 | 2;
  // Merged over the root styles, so it can override them.
  style?: CSSProperties;
};

// A static copy of the mobile app's flashcard study screen, front direction
// (mobile-app/src/study/SwipeGrade.tsx with study/Card/CardFront.tsx): the
// card centered in the room above the grade buttons. It fills the height of
// its parent. Every size is in em, where 1em stands for the app's 16px.
export const Flashcard = ({
  item,
  language,
  grades,
  hint,
  hideExamples = false,
  selected,
  style,
}: Props) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Roboto', sans-serif",
      fontSize: '4.5cqmin',
      lineHeight: 1.25,
      color: onBackground,
      ...style,
    }}
  >
    <div
      style={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <CardFront item={item} language={language} hideExamples={hideExamples} />

      {hint && (
        // A soft button under the card: a pill tinted with the primary color.
        <div
          style={{
            alignSelf: 'center',
            marginTop: '2em',
            padding: '0.625em 1.25em',
            borderRadius: '1.5em',
            background: primarySoft,
            color: primary,
            fontSize: '0.875em',
            fontWeight: 500,
            textAlign: 'center',
          }}
        >
          {hint}
        </div>
      )}
    </div>

    <div
      style={{
        display: 'flex',
        gap: '0.375em',
        // The app's 18px above the home indicator.
        marginBottom: '1.125em',
      }}
    >
      {grades.map((grade, index) => {
        const chosen = index === selected;
        const color = chosen ? background : primary;
        return (
          <div
            key={index}
            style={{
              flex: '1 1 0',
              // Keeps the three the same width; a label too long for its
              // third wraps instead of widening its button.
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              // When one label wraps, the others keep their icons in line
              // with its icon at the top.
              justifyContent: 'flex-start',
              gap: '0.25em',
              padding: '0.5em 0.25em',
              border: `0.0625em solid ${primary}`,
              borderRadius: radii[index],
              background: chosen ? primary : background,
              color,
              textAlign: 'center',
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill={color}
              style={{ display: 'block', width: '1.5em', height: '1.5em' }}
            >
              <path d={icons[index]} />
            </svg>
            {/* React Native Paper's plain Text is 14px. */}
            <span style={{ fontSize: '0.875em' }}>{grade}</span>
          </div>
        );
      })}
    </div>
  </div>
);
