import type { ReactNode } from 'react';
import type {
  AnalysisItem as AnalysisItemType,
  GoogleLanguage,
} from '@vocably/model';
import { languageTranslations } from '@vocably/i18n';
import type { Language } from '../languages';
import { AnalysisItem } from './AnalysisItem';

// The extension's primary color (packages/styles/_variables.scss).
const primary = '#0050ff';
const body = '#1f1f1f';
const muted = '#5c5c5c';
// The light gray of the header and the tab bar.
const chrome = '#f8f8fa';
const divider = '#d6d6d6';

// Material Design Icons, the ones the app's TabsNavigator uses.
const tabIcons = {
  myCards:
    'M21 16V6H7V16H21M21 4C21.53 4 22.04 4.21 22.41 4.59C22.79 4.96 23 5.47 23 6V16C23 16.53 22.79 17.04 22.41 17.41C22.04 17.79 21.53 18 21 18H7C5.89 18 5 17.1 5 16V6C5 4.89 5.89 4 7 4H21M3 20H18V22H3C2.47 22 1.96 21.79 1.59 21.41C1.21 21.04 1 20.53 1 20V9H3V20Z',
  lookUp:
    'M12.87,15.07L10.33,12.56L10.36,12.53C12.1,10.59 13.34,8.36 14.07,6H17V4H10V2H8V4H1V6H12.17C11.5,7.92 10.44,9.75 9,11.35C8.07,10.32 7.3,9.19 6.69,8H4.69C5.42,9.63 6.42,11.17 7.67,12.56L2.58,17.58L4,19L9,14L12.11,17.11L12.87,15.07M18.5,10H16.5L12,22H14L15.12,19H19.87L21,22H23L18.5,10M15.88,17L17.5,12.67L19.12,17H15.88Z',
  tools:
    'M20 8H17V6C17 4.9 16.1 4 15 4H9C7.9 4 7 4.9 7 6V8H4C2.9 8 2 8.9 2 10V20H22V10C22 8.9 21.1 8 20 8M9 6H15V8H9V6M20 18H4V15H6V16H8V15H16V16H18V15H20V18M18 13V12H16V13H8V12H6V13H4V10H20V13H18Z',
  settings:
    'M8 13C6.14 13 4.59 14.28 4.14 16H2V18H4.14C4.59 19.72 6.14 21 8 21S11.41 19.72 11.86 18H22V16H11.86C11.41 14.28 9.86 13 8 13M8 19C6.9 19 6 18.1 6 17C6 15.9 6.9 15 8 15S10 15.9 10 17C10 18.1 9.1 19 8 19M19.86 6C19.41 4.28 17.86 3 16 3S12.59 4.28 12.14 6H2V8H12.14C12.59 9.72 14.14 11 16 11S19.41 9.72 19.86 8H22V6H19.86M16 9C14.9 9 14 8.1 14 7C14 5.9 14.9 5 16 5S18 5.9 18 7C18 8.1 17.1 9 16 9Z',
};

const swapHorizontal = 'M21,9L17,5V8H10V10H17V13M7,11L3,15L7,19V16H14V14H7V11Z';
const closeCircle =
  'M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z';
const magnify =
  'M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z';

type Tab = keyof typeof tabIcons;

type Copy = Record<Tab, string> & {
  // The examples label, `analysis.examples` in the app.
  examples: string;
};

// From the app's mobile-app/src/i18n/locales: `nav.*` and
// `analysis.examples`.
const translations: Record<Language, Copy> = {
  en: {
    myCards: 'My cards',
    lookUp: 'Dictionary',
    tools: 'Tools',
    settings: 'Settings',
    examples: 'Examples',
  },
  es: {
    myCards: 'Mis tarjetas',
    lookUp: 'Diccionario',
    tools: 'Herramientas',
    settings: 'Ajustes',
    examples: 'Ejemplos',
  },
  pt: {
    myCards: 'Meus cartões',
    lookUp: 'Dicionário',
    tools: 'Ferramentas',
    settings: 'Configurações',
    examples: 'Exemplos',
  },
  ru: {
    myCards: 'Карточки',
    lookUp: 'Словарь',
    tools: 'Инструменты',
    settings: 'Настройки',
    examples: 'Примеры',
  },
  uk: {
    myCards: 'Картки',
    lookUp: 'Словник',
    tools: 'Інструменти',
    settings: 'Налаштування',
    examples: 'Приклади',
  },
  tr: {
    myCards: 'Kartlarım',
    lookUp: 'Sözlük',
    tools: 'Araçlar',
    settings: 'Ayarlar',
    examples: 'Örnekler',
  },
  vi: {
    myCards: 'Thẻ của tôi',
    lookUp: 'Từ điển',
    tools: 'Công cụ',
    settings: 'Cài đặt',
    examples: 'Ví dụ',
  },
  zh: {
    myCards: '我的卡片',
    lookUp: '词典',
    tools: '工具',
    settings: '设置',
    examples: '例句',
  },
  'zh-TW': {
    myCards: '我的卡片',
    lookUp: '字典',
    tools: '工具',
    settings: '設定',
    examples: '例句',
  },
};

const Icon = ({
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
    style={{ display: 'block', width: size, height: size, flexShrink: 0 }}
  >
    <path d={path} />
  </svg>
);

const LanguageButton = ({
  selected,
  children,
}: {
  selected?: boolean;
  children: ReactNode;
}) => (
  <div
    style={{
      flex: 1,
      minWidth: 0,
      height: 44,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 12px',
      border: `1.5px solid ${primary}`,
      borderRadius: 22,
      background: selected ? primary : '#fff',
      color: selected ? '#fff' : primary,
      fontSize: 16,
      fontWeight: 500,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    }}
  >
    {children}
  </div>
);

type Props = {
  // The interface language: the labels and the language names.
  language: Language;
  // The language the user studies, on the selected left button.
  sourceLanguage: GoogleLanguage;
  // The language the user translates into, on the right button.
  targetLanguage: GoogleLanguage;
  // The search field text.
  query: string;
  // What /analyze returns for `query`, listed under the search field.
  items: AnalysisItemType[];
};

// The mobile app's Dictionary tab: the language buttons, the search field,
// the analysis items and the tab bar. Fills the screen of an <IPhone3D>
// below its status bar, so it is laid out in the iPhone's screen points
// (440×956), as px.
export const MobileTranslation = ({
  language,
  sourceLanguage,
  targetLanguage,
  query,
  items,
}: Props) => {
  const copy = translations[language];
  const languageName = (code: GoogleLanguage) =>
    languageTranslations[language][`nominative_${code}`] ?? code;

  return (
    <div
      style={{
        // Out of the screen's padding, over the whole screen. Behind the
        // status bar, so the header's gray continues under it.
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        display: 'flex',
        flexDirection: 'column',
        // The screen's rounded corners, so the header and the tab bar
        // don't stick out of them.
        borderRadius: 62,
        overflow: 'hidden',
        fontFamily: "'Roboto', sans-serif",
        color: body,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          // The 62pt status bar, then the header's own 16pt.
          padding: '78px 20px 26px',
          background: chrome,
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.08)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <LanguageButton selected>
            {languageName(sourceLanguage)}
          </LanguageButton>
          <Icon path={swapHorizontal} size={26} color={primary} />
          <LanguageButton>{languageName(targetLanguage)}</LanguageButton>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            height: 58,
            padding: '0 20px',
            borderRadius: 20,
            background: '#fff',
            boxShadow: '0 1px 6px rgba(0, 0, 0, 0.1)',
            fontSize: 20,
          }}
        >
          <span
            style={{
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {query}
          </span>
          <Icon path={closeCircle} size={22} color="#8a8a8a" />
          <Icon path={magnify} size={26} color="#8a8a8a" />
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, background: '#fff' }}>
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              padding: '24px 28px 22px',
              borderBottom: `1px solid ${divider}`,
            }}
          >
            <AnalysisItem
              item={item}
              language={language}
              learn=""
              example={copy.examples}
              learnIcon
              style={{ width: '100%', fontSize: 17 }}
            />
          </div>
        ))}
      </div>

      <div
        style={{
          display: 'flex',
          // Room for the home indicator.
          padding: '10px 0 34px',
          borderTop: `1px solid ${divider}`,
          background: chrome,
        }}
      >
        {(Object.keys(tabIcons) as Tab[]).map((tab) => {
          const color = tab === 'lookUp' ? primary : muted;
          return (
            <div
              key={tab}
              style={{
                flex: 1,
                minWidth: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                color,
                fontSize: 12,
                whiteSpace: 'nowrap',
              }}
            >
              <Icon path={tabIcons[tab]} size={28} color={color} />
              {copy[tab]}
            </div>
          );
        })}
      </div>
    </div>
  );
};
