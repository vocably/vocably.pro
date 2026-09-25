import type { GoogleLanguage } from '../../../packages/model/src/language';
import brazilFlag from 'circle-flags/flags/br.svg?url';
import taiwanFlag from 'circle-flags/flags/tw.svg?url';
import unknownFlag from 'circle-flags/flags/language/xx.svg?url';

// Round language flags by HatScripts (https://github.com/HatScripts/circle-flags).
// Imported through Vite, so html-to-image can embed them in the export.
const languageFlags = import.meta.glob<string>(
  '../../node_modules/circle-flags/flags/language/*.svg',
  { query: '?url', import: 'default', eager: true }
);

// Languages shown with a country flag instead of a language flag.
// `pt` is Brazilian Portuguese in Vocably, and circle-flags' `pt-br` is split
// with Portugal's flag.
const countryFlags: Partial<Record<GoogleLanguage, string>> = {
  pt: brazilFlag,
  'zh-TW': taiwanFlag,
};

// Google Translate codes whose circle-flags name differs.
const flagOverrides: Partial<Record<GoogleLanguage, string>> = {
  // `en` is the US variant in Vocably.
  en: 'en-us',
};

const flagUrl = (language: GoogleLanguage) => {
  const countryFlag = countryFlags[language];
  if (countryFlag) return countryFlag;
  const code = flagOverrides[language] ?? language.toLowerCase();
  return (
    languageFlags[
      `../../node_modules/circle-flags/flags/language/${code}.svg`
    ] ?? unknownFlag
  );
};

type Props = {
  languages: readonly GoogleLanguage[];
  // Flag diameter in the format's pixels.
  size: number;
  // Flags per row.
  columns?: number;
};

export const Languages = ({ languages, size, columns = 4 }: Props) => {
  const columnGap = size * 0.24;

  // A wrapping flex row rather than a grid, so a short last row is centered.
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        width: columns * size + (columns - 1) * columnGap,
        columnGap,
        rowGap: size * 0.32,
        justifyContent: 'center',
      }}
    >
      {languages.map((language) => (
        <div
          key={language}
          style={{
            // Fixed width, so long names don't change the number of columns.
            width: size,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: size * 0.14,
          }}
        >
          <div
            style={{
              width: size,
              height: size,
              borderRadius: '50%',
              padding: size * 0.05,
              background: '#fff',
              boxShadow: [
                `0 ${size * 0.08}px ${size * 0.2}px rgba(15, 23, 42, 0.16)`,
                `0 ${size * 0.02}px ${size * 0.04}px rgba(15, 23, 42, 0.1)`,
              ].join(', '),
            }}
          >
            <img
              src={flagUrl(language)}
              alt=""
              style={{ display: 'block', width: '100%', height: '100%' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};
