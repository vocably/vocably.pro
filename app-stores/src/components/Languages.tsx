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
  // Base flag diameter in the format's pixels; flags are drawn FLAG_SCALE times bigger.
  size: number;
  // Flags per row.
  columns?: number;
};

// How much bigger a flag is drawn than `size`.
const FLAG_SCALE = 1.3;
// How far neighbouring flags overlap, relative to the flag diameter.
const OVERLAP = 0.06;

export const Languages = ({ languages, size, columns = 4 }: Props) => {
  const flagSize = size * FLAG_SCALE;
  // CSS `gap` can't be negative, so each flag pulls its neighbours in with a
  // negative margin of half the overlap on every side.
  const overlap = flagSize * OVERLAP;
  // Explicit rows rather than a wrapping flex row, so every row holds exactly
  // `columns` flags however the parent sizes us, and a short last row is
  // centered.
  const rows: GoogleLanguage[][] = [];
  for (let i = 0; i < languages.length; i += columns) {
    rows.push(languages.slice(i, i + columns));
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexShrink: 0,
        // Brings the outer flags' edges back inside the layout box.
        margin: overlap / 2,
      }}
    >
      {rows.map((row) => (
        <div key={row.join()} style={{ display: 'flex', flexWrap: 'nowrap' }}>
          {row.map((language) => (
            <div
              key={language}
              style={{
                width: flagSize,
                height: flagSize,
                flexShrink: 0,
                margin: -overlap / 2,
                borderRadius: '50%',
                padding: flagSize * 0.05,
                background: '#fff',
                boxShadow: [
                  `0 ${flagSize * 0.08}px ${flagSize * 0.2}px rgba(15, 23, 42, 0.16)`,
                  `0 ${flagSize * 0.02}px ${flagSize * 0.04}px rgba(15, 23, 42, 0.1)`,
                ].join(', '),
              }}
            >
              <img
                src={flagUrl(language)}
                alt=""
                style={{ display: 'block', width: '100%', height: '100%' }}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
