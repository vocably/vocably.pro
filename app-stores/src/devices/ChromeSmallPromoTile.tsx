import type { CSSProperties, ReactNode } from 'react';
import { Device, Screenshot } from '../Device';
import { getFormat } from '../formats';
import { Accent } from '../components/Accent';
import { AnalysisItem } from '../components/AnalysisItem';
import { ChromeWindow } from '../components/ChromeWindow';
import { ExtensionPopup } from '../components/ExtensionPopup';
import { Languages } from '../components/Languages';
import { flags } from '../flags';
import { localization } from '../localization';

const format = getFormat('cws-small-promo-tile');

// macOS text selection blue.
const selection = 'rgba(0, 122, 255, 0.25)';

// The flags that fit under the headline.
const FLAG_COUNT = 5;

// The headline's font size, in cqmin, when its longest line is at most
// HEADLINE_CHARS long; longer lines shrink it so they clear the window.
const HEADLINE_SIZE = 13;
const HEADLINE_CHARS = 10;

// Absolutely positioned against the canvas, in cqmin.
const At = ({
  style,
  children,
}: {
  style: CSSProperties;
  children: ReactNode;
}) => <div style={{ position: 'absolute', ...style }}>{children}</div>;

// The headline and the flags on the left; on the right, a Chrome window with
// a word selected and the extension popup over it, both running off the
// canvas.
export const ChromeSmallPromoTile = () => (
  <Device format={format}>
    {(language) => {
      const copy = localization[language];
      const [before, word, after] = copy.article;
      // Only the end of the sentence before the word, so the word sits near
      // the top left of the page.
      const lead = before.split(' ').slice(-3).join(' ');
      const longestLine = Math.max(
        ...copy.cws.promoTile
          .split('\n')
          .map((line) => line.replaceAll('*', '').length)
      );
      const headlineSize =
        HEADLINE_SIZE * Math.min(1, HEADLINE_CHARS / longestLine);

      return (
        <Screenshot>
          <At style={{ left: '98cqmin', top: '10cqmin', width: '90cqmin' }}>
            <ChromeWindow
              url="www.news.com"
              title="Good News"
              style={{ height: '100cqmin', fontSize: '3cqmin' }}
            >
              <div
                style={{
                  padding: '5cqmin 0 0 8cqmin',
                  fontSize: '6cqmin',
                  lineHeight: 1.5,
                  color: '#a0a0a0',
                }}
              >
                {lead}
                <span
                  style={{
                    background: selection,
                    borderRadius: '0.4cqmin',
                    color: '#1a1a1a',
                  }}
                >
                  {word}
                </span>
                {after}
              </div>
            </ChromeWindow>
          </At>
          <At style={{ left: '81cqmin', top: '42cqmin', width: '100cqmin' }}>
            <ExtensionPopup
              language={language}
              sourceLanguage={copy.sourceLanguage}
              hideSelects
              style={{ fontSize: '4cqmin' }}
            >
              <AnalysisItem
                item={copy.searchItem}
                language={language}
                learn={copy.learnButton}
                example={copy.example}
                hideExamples
                hideLearn
                style={{ width: '100%', fontSize: '1em' }}
              />
            </ExtensionPopup>
          </At>
          <At
            style={{
              left: '8cqmin',
              top: 0,
              bottom: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              gap: '6cqmin',
              fontFamily: "'Roboto', sans-serif",
              color: 'rgb(26, 26, 26)',
            }}
          >
            <div
              className="title"
              style={{
                fontSize: `${headlineSize}cqmin`,
                lineHeight: 1.2,
                textAlign: 'left',
              }}
            >
              <Accent text={copy.cws.promoTile} />
            </div>
            <Languages
              languages={flags[language].languages.slice(0, FLAG_COUNT)}
              columns={FLAG_COUNT}
              size={Math.min(format.width, format.height) * 0.09}
            />
            <div style={{ fontSize: '7.5cqmin' }}>{copy.languageCount}</div>
          </At>
        </Screenshot>
      );
    }}
  </Device>
);
