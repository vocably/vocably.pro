import { useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Device, Screenshot } from '../Device';
import { getFormat } from '../formats';
import { Accent } from '../components/Accent';
import { AnalysisItem } from '../components/AnalysisItem';
import { ChromeWindow } from '../components/ChromeWindow';
import { ExtensionPopup } from '../components/ExtensionPopup';
import { IPhone3D } from '../components/IPhone3D';
import { Languages } from '../components/Languages';
import { MultiChoiceQuestion } from '../components/MultiChoiceQuestion';
import { Search } from '../components/Search';
import { StoreBadges } from '../components/StoreBadges';
import { VideoCall } from '../components/VideoCall';
import { YouTubePlayer } from '../components/YouTubePlayer';
import { flags } from '../flags';
import type { Language } from '../languages';
import { localization } from '../localization';

const format = getFormat('cws-screenshot');

// The extension's primary color (packages/styles/_variables.scss).
const primary = '#0050ff';

// macOS text selection blue.
const selection = 'rgba(0, 122, 255, 0.25)';

// Material Design Icons "check-circle".
const checkCircle =
  'M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z';

type Side = 'left' | 'right';

// Where the text starts on the last two screenshots, which the store shows
// side by side.
const textTop = '30cqmin';

// The heading of a screenshot and what follows it, in a column on one side
// of the canvas, centered vertically. The mock fills the other side.
// `inset` is the distance from that side of the canvas. `top` starts the
// column at that distance from the top instead of centering it, so that
// neighbouring screenshots whose columns differ in height line their titles up.
const Text = ({
  side,
  heading: [title, sub],
  inset = '7cqmin',
  top,
  children,
}: {
  side: Side;
  heading: [string, string];
  inset?: string;
  top?: string;
  children?: ReactNode;
}) => (
  <div
    style={{
      position: 'absolute',
      top: top ?? 0,
      bottom: 0,
      [side]: inset,
      width: '55cqmin',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: top ? 'flex-start' : 'center',
      alignItems: side === 'left' ? 'flex-start' : 'flex-end',
      gap: '3.5cqmin',
      textAlign: side,
      fontFamily: "'Roboto', sans-serif",
      color: 'rgb(26, 26, 26)',
    }}
  >
    <div
      className="title"
      style={{ fontSize: '7.5cqmin', lineHeight: 1.2, textAlign: side }}
    >
      <Accent text={title} />
    </div>
    <div style={{ fontSize: '3.6cqmin', lineHeight: 1.35 }}>{sub}</div>
    {children}
  </div>
);

// Absolutely positioned against the canvas, in cqmin.
const At = ({
  style,
  children,
}: {
  style: CSSProperties;
  children: ReactNode;
}) => <div style={{ position: 'absolute', ...style }}>{children}</div>;

// The translation of the screenshots' word, as the extension shows it.
const Item = ({
  language,
  hideExamples,
}: {
  language: Language;
  hideExamples?: boolean;
}) => (
  <AnalysisItem
    item={localization[language].searchItem}
    language={language}
    learn={localization[language].learnButton}
    example={localization[language].example}
    style={{ width: '100%', fontSize: '1em' }}
    hideExamples={hideExamples}
  />
);

// What a phone screen shows, sized in cqmin of the screen's width rather
// than of the canvas. `style` is merged over the defaults.
const PhoneScreen = ({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) => (
  <div
    style={{
      containerType: 'inline-size',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8cqmin',
      ...style,
    }}
  >
    {children}
  </div>
);

// A YouTube player with the extension popup above it, its tail pointing at
// the middle of the clicked subtitle word. The word sits at a different spot
// in every language, so it is measured after every render and again once
// the fonts have loaded.
const SubtitleLookup = ({ language }: { language: Language }) => {
  const copy = localization[language];
  const player = useRef<HTMLDivElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const [tailOffset, setTailOffset] = useState('0px');

  useLayoutEffect(() => {
    let active = true;
    const measure = () => {
      const word = player.current?.querySelector('[data-word]');
      if (!active || !word || !popup.current) {
        return;
      }
      const w = word.getBoundingClientRect();
      const p = popup.current.getBoundingClientRect();
      // The preview scales the canvas down; offsetWidth is unscaled.
      const scale = p.width / popup.current.offsetWidth;
      const offset = (w.left + w.width / 2 - (p.left + p.width / 2)) / scale;
      setTailOffset(`${offset}px`);
    };
    measure();
    document.fonts.ready.then(measure);
    return () => {
      active = false;
    };
    // No dependencies: it re-measures after every render, so moving or
    // resizing either element keeps the tail on the word. Once the offset
    // settles, setting the same string again does not re-render.
  });

  return (
    <>
      <div
        ref={player}
        style={{
          position: 'absolute',
          left: '14cqmin',
          top: '43cqmin',
          width: '72cqmin',
        }}
      >
        <YouTubePlayer
          subtitle={copy.subtitle}
          style={{ fontSize: '1.44cqmin' }}
        />
      </div>
      <div
        ref={popup}
        style={{
          position: 'absolute',
          left: '8cqmin',
          bottom: '35cqmin',
          width: '84cqmin',
        }}
      >
        <ExtensionPopup
          language={language}
          sourceLanguage={copy.sourceLanguage}
          tail
          tailOffset={tailOffset}
          // Larger than the player, with a blue glow instead of the default
          // gray shadow, so the popup stands out against the dark player. A
          // filter, so the tail casts the glow too.
          style={{
            fontSize: '2.4cqmin',
            filter:
              'drop-shadow(0 1.2em 2.4em rgba(0, 80, 255, 0.35)) drop-shadow(0 0 0.06em rgba(0, 80, 255, 0.4))',
          }}
        >
          <Item language={language} />
        </ExtensionPopup>
      </div>
    </>
  );
};

export const ChromeScreenshot = () => (
  <Device format={format}>
    {(language) => {
      const copy = localization[language];
      const [before, word, after] = copy.article;

      return (
        <>
          {/* Selecting a word on a web page. */}
          <Screenshot>
            <Text side="left" inset="14cqmin" heading={copy.cws.save}>
              <Languages
                {...flags[language]}
                columns={flags[language].languages.length}
                size={Math.min(format.width, format.height) * 0.06}
              />
              <div style={{ fontSize: '3.6cqmin' }}>{copy.languageCount}</div>
            </Text>
            <At style={{ left: '94cqmin', top: '12cqmin', width: '90cqmin' }}>
              <ChromeWindow
                url="www.news.com"
                title="Good News"
                style={{ height: '50cqmin', fontSize: '1.8cqmin' }}
              >
                <div
                  style={{
                    padding: '5cqmin 6cqmin',
                    fontSize: '4cqmin',
                    lineHeight: 1.5,
                    color: '#a0a0a0',
                  }}
                >
                  {before}
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
            <At style={{ left: '80cqmin', top: '40cqmin', width: '74cqmin' }}>
              <ExtensionPopup
                language={language}
                sourceLanguage={copy.sourceLanguage}
              >
                <Item language={language} />
              </ExtensionPopup>
            </At>
          </Screenshot>

          {/* Studying in the mobile app. */}
          <Screenshot>
            <At style={{ left: '1cqmin', top: '4.5cqmin' }}>
              <IPhone3D width={Math.min(format.width, format.height) * 0.82}>
                {/* Centered between the 62pt status bar and the bottom of
                    the screen: the negative margins undo the screen's
                    154pt padding, and widen it so the longest answer
                    (Russian) fits on one line. */}
                <PhoneScreen
                  style={{
                    flexGrow: 1,
                    justifyContent: 'center',
                    width: 'calc(100% + 24px)',
                    margin: '-92px 0 -154px',
                  }}
                >
                  <MultiChoiceQuestion
                    item={copy.searchItem}
                    incorrect={copy.incorrectTranslations}
                    language={language}
                    style={{ fontSize: '6.6cqmin' }}
                  />
                </PhoneScreen>
              </IPhone3D>
            </At>
            <Text side="right" inset="21cqmin" heading={copy.cws.phone}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  gap: '1.6cqmin',
                }}
              >
                {copy.cws.phoneFeatures.map((feature) => (
                  <div
                    key={feature}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1.2cqmin',
                      padding: '1cqmin 1.2cqmin 1cqmin 2.4cqmin',
                      borderRadius: '3cqmin',
                      background: primary,
                      boxShadow: '0 1cqmin 3cqmin rgba(0, 80, 255, 0.25)',
                      color: '#fff',
                      fontSize: '2.8cqmin',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {feature}
                    <svg
                      viewBox="0 0 24 24"
                      fill="rgba(255, 255, 255, 0.85)"
                      style={{ display: 'block', width: '1.3em' }}
                    >
                      <path d={checkCircle} />
                    </svg>
                  </div>
                ))}
              </div>
            </Text>
          </Screenshot>

          {/* Clicking a word in YouTube subtitles. */}
          <Screenshot>
            <SubtitleLookup language={language} />
            <Text side="right" inset="10cqmin" heading={copy.cws.youtube} />
          </Screenshot>

          {/* Looking up a word during a video call. */}
          <Screenshot>
            <Text side="left" inset="14cqmin" heading={copy.cws.calls} />
            <At style={{ left: '92cqmin', top: '10cqmin', width: '62cqmin' }}>
              <ChromeWindow
                url="meet.google.com/abc-defg-hij"
                title="Google Meet"
                theme="dark"
                style={{ height: '56cqmin', fontSize: '1.6cqmin' }}
              >
                <VideoCall />
              </ChromeWindow>
            </At>
            <At style={{ left: '75cqmin', top: '34cqmin', width: '76cqmin' }}>
              <ExtensionPopup
                language={language}
                sourceLanguage={copy.sourceLanguage}
                search={copy.search}
              >
                <Item language={language} />
              </ExtensionPopup>
            </At>
          </Screenshot>

          {/* Studying in the web app. */}
          <Screenshot>
            <At style={{ left: '14cqmin', top: '10cqmin', width: '70cqmin' }}>
              <ChromeWindow
                url="app.vocably.pro"
                title="Vocably"
                style={{ height: '80cqmin', fontSize: '1.5cqmin' }}
              >
                <MultiChoiceQuestion
                  item={copy.searchItem}
                  incorrect={copy.incorrectTranslations}
                  language={language}
                  style={{
                    width: '42cqmin',
                    margin: '5cqmin auto 0',
                    fontSize: '2.1cqmin',
                  }}
                />
              </ChromeWindow>
            </At>
            <Text
              side="right"
              inset="14cqmin"
              top={textTop}
              heading={copy.cws.browser}
            />
          </Screenshot>

          {/* The whole ecosystem: the mobile apps. */}
          <Screenshot>
            <Text
              side="left"
              inset="14cqmin"
              top={textTop}
              heading={copy.cws.everywhere}
            >
              <StoreBadges
                appStore={copy.cws.appStoreBadge}
                googlePlay={copy.cws.googlePlayBadge}
              />
            </Text>
            <At style={{ left: '94cqmin', top: '8cqmin' }}>
              <IPhone3D
                phone="02"
                width={Math.min(format.width, format.height) * 0.615}
              >
                <PhoneScreen>
                  <Search query={copy.search} />
                  <AnalysisItem
                    item={copy.searchItem}
                    language={language}
                    learn={copy.learnButton}
                    example={copy.example}
                    style={{ width: '100%', fontSize: '7cqmin' }}
                    learnIcon
                  />
                </PhoneScreen>
              </IPhone3D>
            </At>
          </Screenshot>
        </>
      );
    }}
  </Device>
);
