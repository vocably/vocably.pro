import type { CSSProperties, ReactNode } from 'react';
import type { AnalysisItem as AnalysisItemType } from '@vocably/model';
import { languageTranslations } from '@vocably/i18n';
import type { Language } from '../languages';
import { AnalysisItem } from './AnalysisItem';
import { Handle, handleSize, selection } from './AndroidSelection';
import { PageText } from './PageText';

type Props = {
  // The e-book text around the selected word: before, selection, after.
  text: [string, string, string];
  // The interface language, which the sheet is written in.
  language: Language;
  // The study language, on the left language button.
  sourceLanguage: string;
  // The header button that closes the sheet, `common.done` in the app.
  done: string;
  item: AnalysisItemType;
  learn: string;
  example: string;
  style?: CSSProperties;
};

// The mobile app's light theme (mobile-app/src/ThemeProvider.tsx).
const primary = 'rgb(0, 80, 255)';
const onSurface = 'rgb(106, 106, 106)';
const outline = 'rgb(0, 80, 255)';
const inputBg = 'rgba(106, 106, 106, 0.05)';
const inputIconColor = 'rgba(106, 106, 106, 0.6)';
const elevationLevel1 = 'rgb(252, 252, 252)';

// One density-independent pixel of the app, in cqmin, so the sheet keeps the
// app's proportions on every format.
const dp = (value: number) => `${value * 0.26}cqmin`;

const upperFirst = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const languageName = (language: Language, code: string) =>
  upperFirst(
    languageTranslations[language][`nominative_short_${code}`] ?? code
  );

// A Material Design Icons glyph, inline, so html-to-image embeds it.
const MdiIcon = ({
  path,
  size,
  color,
}: {
  path: string;
  size: number;
  color: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill={color}
    style={{ display: 'block', width: dp(size), height: dp(size) }}
  >
    <path d={path} />
  </svg>
);

const swapHorizontal = 'M21,9L17,5V8H10V10H17V13M7,11L3,15L7,19V16H14V14H7V11Z';
const closeCircle =
  'M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z';
const magnify =
  'M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z';

// A react-native-paper button of the translation preset form, contained or
// outlined.
const LanguageButton = ({
  children,
  outlined,
}: {
  children: ReactNode;
  outlined?: boolean;
}) => (
  <div
    style={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      height: dp(40),
      borderRadius: dp(20),
      background: outlined ? 'transparent' : primary,
      border: outlined ? `${dp(1)} solid ${outline}` : 'none',
      color: outlined ? primary : '#fff',
      fontSize: dp(14),
      fontWeight: 500,
      letterSpacing: dp(0.1),
    }}
  >
    {children}
  </div>
);

// An e-book page with a long-pressed word, and the app's Android share sheet
// over the reader: the shared look-up of mobile-app/src/LookUpScreen.tsx
// (`isSharedLookUp`) with the analysis of the word. The sheet runs off the
// bottom of the canvas, like the lower part of a phone screen.
export const AndroidEbookLookUp = ({
  text: [before, word, after],
  language,
  sourceLanguage,
  done,
  item,
  learn,
  example,
  style,
}: Props) => (
  <div
    style={{
      flex: 1,
      minHeight: 0,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      // Less than the selection handles hang below the text, so the sheet
      // covers their lower half, like a sheet opened over the reader.
      gap: `${handleSize / 2}cqmin`,
      // Closer to the title than the Placeholder gap, to show more of the sheet.
      marginTop: '-3cqmin',
      ...style,
    }}
  >
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

    <div
      style={{
        flex: 1,
        minHeight: 0,
        width: '94%',
        // Above the absolutely positioned selection handles.
        position: 'relative',
        // Runs past the Placeholder padding to the canvas bottom.
        marginBottom: '-6cqmin',
        overflow: 'hidden',
        borderTopLeftRadius: dp(16),
        borderTopRightRadius: dp(16),
        background: '#fff',
        boxShadow: '0 0 6cqmin rgba(0, 0, 0, 0.18)',
        fontFamily: "'Roboto', sans-serif",
        color: onSurface,
      }}
    >
      {/* The header Surface, elevation 1. */}
      <div
        style={{
          paddingBottom: dp(24),
          background: elevationLevel1,
          boxShadow: `0 ${dp(1)} ${dp(3)} rgba(0, 0, 0, 0.15)`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: `${dp(16)} ${dp(8)} 0 ${dp(24)}`,
          }}
        >
          <div style={{ fontSize: dp(18) }}>Vocably</div>
          <div
            style={{
              marginLeft: 'auto',
              padding: `${dp(10)} ${dp(12)}`,
              color: primary,
              fontSize: dp(14),
              fontWeight: 500,
              letterSpacing: dp(0.1),
            }}
          >
            {done}
          </div>
        </div>

        {/* TranslationPresetForm */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: `${dp(4)} ${dp(16)} ${dp(12)}`,
          }}
        >
          <LanguageButton>
            {languageName(language, sourceLanguage)}
          </LanguageButton>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              width: dp(65),
            }}
          >
            <MdiIcon path={swapHorizontal} size={24} color={onSurface} />
          </div>
          <LanguageButton outlined>
            {languageName(language, language)}
          </LanguageButton>
        </div>

        {/* SearchInput, with the shared text in it. */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: `0 ${dp(16)}`,
            paddingLeft: dp(12),
            borderRadius: dp(16),
            background: inputBg,
          }}
        >
          <div
            style={{
              flex: 1,
              padding: `${dp(12)} 0 ${dp(10)}`,
              fontSize: dp(18),
              color: '#000',
            }}
          >
            {word}
          </div>
          <div style={{ padding: dp(12) }}>
            <MdiIcon path={closeCircle} size={18} color={inputIconColor} />
          </div>
          <div style={{ padding: dp(12) }}>
            <MdiIcon path={magnify} size={24} color={inputIconColor} />
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          paddingTop: dp(28),
        }}
      >
        <AnalysisItem
          item={item}
          language={language}
          learn={learn}
          example={example}
          learnIcon
        />
      </div>
    </div>
  </div>
);
