import { useRef } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Device, Screenshot } from '../Device';
import { getFormat } from '../formats';
import { Accent } from '../components/Accent';
import { AnalysisItem } from '../components/AnalysisItem';
import { ChromeWindow } from '../components/ChromeWindow';
import { ExtensionPopup } from '../components/ExtensionPopup';
import { Flashcard } from '../components/Flashcard';
import { IPhone3D } from '../components/IPhone3D';
import { Languages } from '../components/Languages';
import { MobileTranslation } from '../components/MobileTranslation';
import { MultiChoiceQuestion } from '../components/MultiChoiceQuestion';
import { StoreBadges } from '../components/StoreBadges';
import { VideoCall } from '../components/VideoCall';
import { YouTubePlayer } from '../components/YouTubePlayer';
import { useTailOffset } from '../components/useTailOffset';
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

// The heading of a screenshot and what follows it, in a column on one side
// of the canvas, centered vertically. The mock fills the other side.
// `inset` is the distance from that side of the canvas. `noWrap` keeps the
// title on one line, even if it runs past the column.
const Text = ({
  side,
  heading: [title, sub],
  inset = '7cqmin',
  noWrap,
  children,
}: {
  side: Side;
  heading: [string, string];
  inset?: string;
  noWrap?: boolean;
  children?: ReactNode;
}) => (
  <div
    style={{
      position: 'absolute',
      top: 0,
      bottom: 0,
      [side]: inset,
      width: '55cqmin',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: side === 'left' ? 'flex-start' : 'flex-end',
      gap: '3.5cqmin',
      textAlign: side,
      fontFamily: "'Roboto', sans-serif",
      color: 'rgb(26, 26, 26)',
    }}
  >
    <div
      className="title"
      style={{
        fontSize: '7.5cqmin',
        lineHeight: 1.2,
        textAlign: side,
        whiteSpace: noWrap ? 'nowrap' : undefined,
      }}
    >
      <Accent text={title} />
    </div>
    <div
      style={{ fontSize: '3.6cqmin', lineHeight: 1.35, whiteSpace: 'pre-line' }}
    >
      {sub}
    </div>
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
  pointAtLearn,
}: {
  language: Language;
  hideExamples?: boolean;
  pointAtLearn?: boolean;
}) => (
  <AnalysisItem
    item={localization[language].searchItem}
    language={language}
    learn={localization[language].learnButton}
    example={localization[language].example}
    style={{ width: '100%', fontSize: '1em' }}
    hideExamples={hideExamples}
    pointAtLearn={pointAtLearn}
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

// A web page with a word selected and the extension popup below it, its
// tail pointing at the middle of the word.
const SelectionLookup = ({ language }: { language: Language }) => {
  const copy = localization[language];
  const [before, word, after] = copy.article;
  const page = useRef<HTMLDivElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const tailOffset = useTailOffset(page, popup);

  return (
    <>
      <At style={{ left: '94cqmin', top: '12cqmin', width: '82cqmin' }}>
        <ChromeWindow
          url="www.news.com"
          title="Good News"
          style={{ height: '50cqmin', fontSize: '1.8cqmin' }}
        >
          <div
            ref={page}
            style={{
              padding: '5cqmin 6cqmin',
              fontSize: '4cqmin',
              lineHeight: 1.5,
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
          left: '80cqmin',
          top: '40cqmin',
          width: '74cqmin',
        }}
      >
        <ExtensionPopup
          language={language}
          sourceLanguage={copy.sourceLanguage}
          tail
          tailSide="top"
          tailOffset={tailOffset}
        >
          <Item language={language} pointAtLearn />
        </ExtensionPopup>
      </div>
    </>
  );
};

// A YouTube player with the extension popup above it, its tail pointing at
// the middle of the clicked subtitle word.
const SubtitleLookup = ({ language }: { language: Language }) => {
  const copy = localization[language];
  const player = useRef<HTMLDivElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const tailOffset = useTailOffset(player, popup);

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
          pointer
          style={{ fontSize: '1.44cqmin' }}
        />
      </div>
      <div
        ref={popup}
        style={{
          position: 'absolute',
          left: '8cqmin',
          bottom: '33cqmin',
          width: '84cqmin',
        }}
      >
        <ExtensionPopup
          language={language}
          sourceLanguage={copy.sourceLanguage}
          tail
          tailOffset={tailOffset}
          tailSize="1.8em"
          // Larger than the player, so the popup stands out against it.
          style={{ fontSize: '2.4cqmin' }}
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

      return (
        <>
          {/* Selecting a word on a web page. */}
          <Screenshot>
            {/* The Chinese title is a bit wider than the column, and
                wrapping it leaves one character on the second line. It
                still ends well before the popup. */}
            <Text
              side="left"
              inset="14cqmin"
              heading={copy.cws.save}
              noWrap={language === 'zh' || language === 'zh-TW'}
            >
              <Languages
                {...flags[language]}
                columns={flags[language].languages.length}
                size={Math.min(format.width, format.height) * 0.06}
              />
              <div style={{ fontSize: '3.6cqmin' }}>{copy.languageCount}</div>
            </Text>
            <SelectionLookup language={language} />
          </Screenshot>

          {/* Studying in the web app and in the mobile app. */}
          <Screenshot>
            {/* Beneath the phone, which covers its right part, so the
                question sits on the left. */}
            <At style={{ left: '8cqmin', top: '22cqmin', width: '50cqmin' }}>
              <ChromeWindow
                url="vocably.pro/app"
                title="Vocably"
                style={{ height: '58cqmin', fontSize: '1.2cqmin' }}
              >
                <MultiChoiceQuestion
                  item={copy.searchItem}
                  incorrect={copy.incorrectTranslations}
                  language={language}
                  answered
                  style={{
                    width: '27cqmin',
                    margin: '4cqmin 0 0 4cqmin',
                    fontSize: '1.7cqmin',
                  }}
                />
              </ChromeWindow>
            </At>
            <At style={{ left: '27cqmin', top: '12cqmin' }}>
              <IPhone3D width={Math.min(format.width, format.height) * 0.7}>
                {/* From the 62pt status bar down to the home indicator:
                    the negative margins undo most of the screen's 154pt
                    padding, and widen it so the longest grade fits. */}
                <PhoneScreen
                  style={{
                    flexGrow: 1,
                    width: 'calc(100% + 24px)',
                    margin: '-92px 0 -120px',
                  }}
                >
                  <Flashcard
                    item={copy.searchItem}
                    language={language}
                    grades={copy.grades}
                    hint={copy.revealHint}
                    style={{ fontSize: '6.6cqmin' }}
                  />
                </PhoneScreen>
              </IPhone3D>
            </At>
            <Text side="right" inset="14cqmin" heading={copy.cws.study}>
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
                pointer
                style={{ height: '56cqmin', fontSize: '1.6cqmin' }}
              >
                <VideoCall />
              </ChromeWindow>
            </At>
            <At style={{ left: '75cqmin', top: '26cqmin', width: '76cqmin' }}>
              <ExtensionPopup
                language={language}
                sourceLanguage={copy.sourceLanguage}
                search={copy.search}
              >
                <Item language={language} />
              </ExtensionPopup>
            </At>
          </Screenshot>

          {/* The whole ecosystem: the mobile apps. */}
          <Screenshot>
            <Text side="left" inset="22cqmin" heading={copy.cws.everywhere}>
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
                <MobileTranslation
                  language={language}
                  sourceLanguage={copy.sourceLanguage}
                  targetLanguage={language}
                  query={copy.search}
                  items={copy.phoneSearchItems}
                />
              </IPhone3D>
            </At>
          </Screenshot>
        </>
      );
    }}
  </Device>
);
