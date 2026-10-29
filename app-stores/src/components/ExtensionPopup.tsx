import type { CSSProperties, ReactNode } from 'react';
import type { GoogleLanguage } from '@vocably/model';
import { languageTranslations } from '@vocably/i18n';
import { en } from '../../../packages/extension-content-ui/src/i18n/en';
import { es } from '../../../packages/extension-content-ui/src/i18n/es';
import { pt } from '../../../packages/extension-content-ui/src/i18n/pt';
import { ru } from '../../../packages/extension-content-ui/src/i18n/ru';
import { tr } from '../../../packages/extension-content-ui/src/i18n/tr';
import { uk } from '../../../packages/extension-content-ui/src/i18n/uk';
import { vi } from '../../../packages/extension-content-ui/src/i18n/vi';
import { zh } from '../../../packages/extension-content-ui/src/i18n/zh';
import { zhTW } from '../../../packages/extension-content-ui/src/i18n/zh-TW';
import type { Language } from '../languages';
import { Logo } from './Logo';

// The extension's own interface strings, so the popup reads as it does in
// the extension.
const popupTranslations: Record<Language, Record<string, string>> = {
  en,
  es,
  pt,
  ru,
  uk,
  tr,
  vi,
  zh,
  'zh-TW': zhTW,
};

// Colors of the extension's light theme (packages/styles/_variables.scss).
const body = '#1f1f1f';
const muted = '#5c5c5c';
const field = '#f2f2f2';
const primary = '#0050ff';

const Icon = ({ path, style }: { path: string; style?: CSSProperties }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ display: 'block', flexShrink: 0, ...style }}
  >
    <path d={path} />
  </svg>
);

// Material Design Icons.
const close =
  'M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z';
const chevronDown =
  'M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z';
const menuRight = 'M10,17L15,12L10,7V17Z';
const magnify =
  'M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z';

// One of the "I study" / "I speak" language selects.
const Select = ({ label, value }: { label: string; value: string }) => (
  <div
    style={{
      flex: 1,
      minWidth: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5em',
      padding: '0.7em 0.8em 0.7em 1em',
      borderRadius: '0.5em',
      background: field,
      color: muted,
    }}
  >
    <span
      style={{
        flex: 1,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      }}
    >
      {label} <b style={{ color: body }}>{value}</b>
    </span>
    <Icon path={chevronDown} style={{ width: '1.2em', height: '1.2em' }} />
  </div>
);

type Props = {
  // The interface language, which is also the language the user speaks.
  language: Language;
  // The language the user studies.
  sourceLanguage: GoogleLanguage;
  // Shows the popup's search field with this query typed in.
  search?: string;
  // Points a tail from the bottom center of the popup to what was clicked.
  tail?: boolean;
  // Moves the tail sideways from the center by this CSS length, e.g.
  // '-10em' or '20%'; negative values move it left.
  tailOffset?: string;
  // The popup content, usually an <AnalysisItem>.
  children: ReactNode;
  style?: CSSProperties;
};

// The extension's translation popup
// (extension-content-ui/src/components/popup): the header, the language
// selects, an optional search field and the content. Every size is in em,
// so the popup scales with its `fontSize`, which defaults to 2cqmin.
export const ExtensionPopup = ({
  language,
  sourceLanguage,
  search,
  tail = false,
  tailOffset = '0em',
  children,
  style,
}: Props) => {
  const t = popupTranslations[language];
  const languageName = (code: GoogleLanguage) =>
    languageTranslations[language][`nominative_${code}`] ?? code;

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: '1em',
        padding: '1.4em 1.5em 1.6em',
        borderRadius: '1em',
        background: '#fff',
        // A filter rather than a box shadow, so the tail casts one too.
        filter:
          'drop-shadow(0 1.2em 2em rgba(15, 23, 42, 0.18)) drop-shadow(0 0 0.06em rgba(15, 23, 42, 0.25))',
        fontFamily: "'Roboto', sans-serif",
        fontSize: '2cqmin',
        lineHeight: 1.25,
        color: body,
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Logo style={{ display: 'block', height: '1.5em', width: 'auto' }} />
        <Icon
          path={close}
          style={{ width: '1.6em', height: '1.6em', color: '#bababa' }}
        />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6em' }}>
        <Select
          label={t['translation.i_study']}
          value={languageName(sourceLanguage)}
        />
        <Icon
          path={menuRight}
          style={{ width: '1.4em', height: '1.4em', color: muted }}
        />
        <Select
          label={t['translation.i_speak']}
          value={languageName(language)}
        />
      </div>
      {search !== undefined && (
        // Drawn focused, with a primary border, a focus ring and a text
        // caret after the query, so it reads as a field being typed in.
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            borderRadius: '0.5em',
            background: '#fff',
            border: `0.12em solid ${primary}`,
            boxShadow: `0 0 0 0.25em rgba(0, 80, 255, 0.15)`,
            overflow: 'hidden',
          }}
        >
          <span
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              padding: '0.75em 1em',
            }}
          >
            {search}
            <span
              style={{
                display: 'inline-block',
                width: '0.1em',
                height: '1.25em',
                marginLeft: '0.08em',
                background: primary,
              }}
            />
          </span>
          <span
            style={{
              alignSelf: 'stretch',
              display: 'flex',
              alignItems: 'center',
              padding: '0 0.8em',
              background: primary,
              color: '#fff',
            }}
          >
            <Icon path={magnify} style={{ width: '1.5em', height: '1.5em' }} />
          </span>
        </div>
      )}
      <div
        style={{
          paddingTop: '1em',
          borderTop: `0.06em solid ${field}`,
        }}
      >
        {children}
      </div>
      {tail && (
        <svg
          viewBox="0 0 24 12"
          fill="#fff"
          style={{
            position: 'absolute',
            top: '100%',
            left: `calc(50% + ${tailOffset})`,
            width: '2.4em',
            height: '1.2em',
            marginLeft: '-1.2em',
            marginTop: '-0.05em',
          }}
        >
          <path d="M0,0H24L12,12Z" />
        </svg>
      )}
    </div>
  );
};
