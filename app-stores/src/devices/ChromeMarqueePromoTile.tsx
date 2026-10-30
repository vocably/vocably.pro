import { useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode, RefObject } from 'react';
import { Device, Screenshot } from '../Device';
import { getFormat } from '../formats';
import { Accent } from '../components/Accent';
import { AnalysisItem } from '../components/AnalysisItem';
import { ChromeWindow } from '../components/ChromeWindow';
import { ExtensionPopup } from '../components/ExtensionPopup';
import { Languages } from '../components/Languages';
import { useTailOffset } from '../components/useTailOffset';
import { flags } from '../flags';
import type { Language } from '../languages';
import { localization } from '../localization';

const format = getFormat('cws-marquee-promo-tile');

// macOS text selection blue.
const selection = 'rgba(0, 122, 255, 0.25)';

// Absolutely positioned against the canvas, in cqmin.
const At = ({
  style,
  children,
}: {
  style: CSSProperties;
  children: ReactNode;
}) => <div style={{ position: 'absolute', ...style }}>{children}</div>;

// The gap between the bottom of the selected word and the top of the popup,
// which the popup's tail spans.
const POPUP_GAP = '4cqmin';

// Where the bottom of the word inside `target` is, from the top of the
// popup's positioned parent. The article wraps differently in every
// language, so it is measured after every render and again once the fonts
// have loaded.
const useWordBottom = (
  target: RefObject<HTMLElement | null>,
  popup: RefObject<HTMLElement | null>
) => {
  const [wordBottom, setWordBottom] = useState('0px');

  useLayoutEffect(() => {
    let active = true;
    const measure = () => {
      const word = target.current?.querySelector('[data-word]');
      const parent = popup.current?.offsetParent;
      if (!active || !word || !popup.current || !parent) {
        return;
      }
      const w = word.getBoundingClientRect();
      const p = parent.getBoundingClientRect();
      // The preview scales the canvas down; offsetWidth is unscaled.
      const scale =
        popup.current.getBoundingClientRect().width / popup.current.offsetWidth;
      setWordBottom(`${(w.bottom - p.top) / scale}px`);
    };
    measure();
    document.fonts.ready.then(measure);
    return () => {
      active = false;
    };
  });

  return wordBottom;
};

// A Chrome window with an article, a word in it selected and the extension
// popup below the word, its tail pointing at the middle of the word.
const SelectionLookup = ({ language }: { language: Language }) => {
  const copy = localization[language];
  const [before, word, after] = copy.article;
  const page = useRef<HTMLDivElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const tailOffset = useTailOffset(page, popup);
  const wordBottom = useWordBottom(page, popup);

  return (
    <>
      <At style={{ left: '138cqmin', top: '8cqmin', width: '102cqmin' }}>
        <ChromeWindow
          url="www.news.com"
          title="Good News"
          style={{ height: '70cqmin', fontSize: '2.6cqmin' }}
        >
          <div
            ref={page}
            style={{
              padding: '4cqmin 9cqmin',
              fontSize: '4.4cqmin',
              lineHeight: 1.6,
              color: '#a0a0a0',
            }}
          >
            {before}
            <span
              data-word
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
      <div
        ref={popup}
        style={{
          position: 'absolute',
          left: '118cqmin',
          top: `calc(${wordBottom} + ${POPUP_GAP})`,
          width: '96cqmin',
        }}
      >
        <ExtensionPopup
          language={language}
          sourceLanguage={copy.sourceLanguage}
          hideSelects
          tail
          tailSide="top"
          tailOffset={tailOffset}
          style={{ fontSize: '3.2cqmin' }}
        >
          <AnalysisItem
            item={copy.searchItem}
            language={language}
            learn={copy.learnButton}
            example={copy.example}
            hideExamples
            pointAtLearn
            style={{ width: '100%', fontSize: '1em' }}
          />
        </ExtensionPopup>
      </div>
    </>
  );
};

// The headline, the line under it and the flags on the left; on the right,
// a word looked up on a web page.
export const ChromeMarqueePromoTile = () => (
  <Device format={format}>
    {(language) => {
      const copy = localization[language];
      // The small tile's headline on one line that wraps. Chinese puts no
      // spaces between words.
      const headline = copy.cws.promoTile.replaceAll(
        '\n',
        language === 'zh' || language === 'zh-TW' ? '' : ' '
      );

      return (
        <Screenshot>
          <SelectionLookup language={language} />
          <At
            style={{
              left: '14cqmin',
              top: 0,
              bottom: 0,
              width: '92cqmin',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              gap: '4cqmin',
              fontFamily: "'Roboto', sans-serif",
              color: 'rgb(26, 26, 26)',
            }}
          >
            <div
              className="title"
              style={{
                fontSize: '10cqmin',
                lineHeight: 1.2,
                textAlign: 'left',
              }}
            >
              {headline.split(/(，)/).map((part, index) =>
                index % 2 === 1 ? (
                  // A full-width comma is drawn in the left half of its
                  // box, so the right half would leave a gap before the
                  // next word.
                  <span key={index} style={{ marginRight: '-0.45em' }}>
                    {part}
                  </span>
                ) : (
                  <Accent key={index} text={part} />
                )
              )}
            </div>
            <div
              style={{
                fontSize: '5.6cqmin',
                lineHeight: 1.35,
                whiteSpace: 'pre-line',
              }}
            >
              {copy.cws.marqueeSub}
            </div>
            <Languages
              {...flags[language]}
              columns={flags[language].languages.length}
              size={Math.min(format.width, format.height) * 0.075}
            />
            <div style={{ fontSize: '5.6cqmin' }}>
              {copy.languageCount.replace(/[.。]$/, '')}
            </div>
          </At>
        </Screenshot>
      );
    }}
  </Device>
);
