import type { CSSProperties, ReactNode } from 'react';
import { Device, Screenshot } from '../Device';
import { getFormat } from '../formats';
import { Accent } from '../components/Accent';
import { AnalysisItem } from '../components/AnalysisItem';
import { ChromeWindow } from '../components/ChromeWindow';
import { ExtensionPopup } from '../components/ExtensionPopup';
import { IPhone16Max } from '../components/IPhone16Max';
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

// The heading of a screenshot and what follows it, in a column on one side
// of the canvas, centered vertically. The mock fills the other side.
const Text = ({
  side,
  heading: [title, sub],
  children,
}: {
  side: Side;
  heading: [string, string];
  children?: ReactNode;
}) => (
  <div
    style={{
      position: 'absolute',
      top: 0,
      bottom: 0,
      [side]: '7cqmin',
      width: '64cqmin',
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

export const ChromeScreenshot = () => (
  <Device format={format}>
    {(language) => {
      const copy = localization[language];
      const [before, word, after] = copy.article;

      return (
        <>
          {/* Selecting a word on a web page. */}
          <Screenshot>
            <Text side="left" heading={copy.cws.save}>
              <Languages
                {...flags[language]}
                columns={flags[language].languages.length}
                size={Math.min(format.width, format.height) * 0.06}
              />
              <div style={{ fontSize: '3.6cqmin' }}>{copy.languageCount}</div>
            </Text>
            <At style={{ left: '84cqmin', top: '8cqmin', width: '90cqmin' }}>
              <ChromeWindow
                url="www.example.com"
                title="Example"
                style={{ height: '100cqmin', fontSize: '1.8cqmin' }}
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
            <At style={{ left: '72cqmin', top: '50cqmin', width: '74cqmin' }}>
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
            <At
              style={{
                left: '22cqmin',
                top: '10cqmin',
                transform: 'rotate(-8deg)',
              }}
            >
              <IPhone16Max width="42cqmin">
                {/* Auto margins center it vertically on the screen. */}
                <PhoneScreen style={{ margin: 'auto 0' }}>
                  <MultiChoiceQuestion
                    item={copy.searchItem}
                    incorrect={copy.incorrectTranslations}
                    language={language}
                    style={{ fontSize: '6cqmin' }}
                  />
                </PhoneScreen>
              </IPhone16Max>
            </At>
            <Text side="right" heading={copy.cws.phone}>
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
            <At style={{ left: '6cqmin', top: '44cqmin', width: '80cqmin' }}>
              <YouTubePlayer subtitle={copy.subtitle} />
            </At>
            <At
              style={{ left: '11cqmin', bottom: '31cqmin', width: '70cqmin' }}
            >
              <ExtensionPopup
                language={language}
                sourceLanguage={copy.sourceLanguage}
                tail
              >
                <Item language={language} />
              </ExtensionPopup>
            </At>
            <Text side="right" heading={copy.cws.youtube} />
          </Screenshot>

          {/* Looking up a word during a video call. */}
          <Screenshot>
            <Text side="left" heading={copy.cws.calls} />
            <At style={{ left: '82cqmin', top: '6cqmin', width: '72cqmin' }}>
              <ChromeWindow
                url="meet.google.com/abc-defg-hij"
                title="Google Meet"
                theme="dark"
                style={{ height: '56cqmin', fontSize: '1.6cqmin' }}
              >
                <VideoCall />
              </ChromeWindow>
            </At>
            <At style={{ left: '73cqmin', top: '42cqmin', width: '76cqmin' }}>
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
            <At style={{ left: '6cqmin', top: '10cqmin', width: '86cqmin' }}>
              <ChromeWindow
                url="app.vocably.pro"
                title="Vocably"
                style={{ height: '100cqmin', fontSize: '1.8cqmin' }}
              >
                <MultiChoiceQuestion
                  item={copy.searchItem}
                  incorrect={copy.incorrectTranslations}
                  language={language}
                  style={{
                    width: '52cqmin',
                    margin: '6cqmin auto 0',
                    fontSize: '2.6cqmin',
                  }}
                />
              </ChromeWindow>
            </At>
            <Text side="right" heading={copy.cws.browser} />
          </Screenshot>

          {/* The whole ecosystem: the mobile apps. */}
          <Screenshot>
            <Text side="left" heading={copy.cws.everywhere}>
              <StoreBadges
                appStore={copy.cws.appStoreBadge}
                googlePlay={copy.cws.googlePlayBadge}
              />
            </Text>
            <At
              style={{
                left: '100cqmin',
                top: '8cqmin',
                transform: 'rotate(6deg)',
              }}
            >
              <IPhone16Max width="42cqmin">
                <PhoneScreen>
                  <Search query={copy.search} />
                  <AnalysisItem
                    item={copy.searchItem}
                    language={language}
                    learn={copy.learnButton}
                    example={copy.example}
                    style={{ width: '100%', fontSize: '5.5cqmin' }}
                    learnIcon
                  />
                </PhoneScreen>
              </IPhone16Max>
            </At>
          </Screenshot>
        </>
      );
    }}
  </Device>
);
