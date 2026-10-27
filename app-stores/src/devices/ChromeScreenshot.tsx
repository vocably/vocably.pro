import type { ReactNode } from 'react';
import { Device, Screenshot } from '../Device';
import { getFormat } from '../formats';
import { Languages } from '../components/Languages';
import { AnalysisItem } from '../components/AnalysisItem';
import { MultiChoiceQuestion } from '../components/MultiChoiceQuestion';
import { ChromeExtension } from '../components/ChromeExtension';
import { ChromeWindow } from '../components/ChromeWindow';
import { CardList } from '../components/CardList';
import { Logo } from '../components/Logo';
import { flags } from '../flags';
import { localization } from '../localization';
import { Placeholder } from '../templates/Placeholder';

const format = getFormat('cws-screenshot');

// The title and the line under it, at the top of a screenshot.
const Heading = ({ title, sub }: { title: string; sub: string }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.6cqmin',
    }}
  >
    <div className="title" style={{ fontSize: '6.5cqmin' }}>
      {title}
    </div>
    <div className="subtitle" style={{ fontSize: '4cqmin' }}>
      {sub}
    </div>
  </div>
);

// A browser window that rises from the bottom edge of the canvas and is cut
// off by it.
const Bottom = ({ children }: { children: ReactNode }) => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      width: '100%',
      marginTop: 'auto',
      // Through the Placeholder's bottom padding and past the canvas edge.
      marginBottom: '-12cqmin',
    }}
  >
    {children}
  </div>
);

export const ChromeScreenshot = () => (
  <Device format={format}>
    {(language) => (
      <>
        <Screenshot>
          <Placeholder format={format}>
            <Logo className="logo" style={{ width: '30cqmin' }} />
            <div className="title" style={{ fontSize: '6.5cqmin' }}>
              {localization[language].iosHeaderTitle}
            </div>
            <Languages
              {...flags[language]}
              columns={flags[language].languages.length}
              size={Math.min(format.width, format.height) * 0.08}
            />
            <div className="subtitle" style={{ fontSize: '4.5cqmin' }}>
              {localization[language].languageCount}
            </div>
          </Placeholder>
        </Screenshot>
        <Screenshot>
          <Placeholder format={format} fixedTitle titleTop={0.08}>
            <Heading
              title={localization[language].extension}
              sub={localization[language].chromeExtensionSub}
            />
            <Bottom>
              <ChromeExtension
                text={localization[language].pageText}
                style={{
                  width: '128cqmin',
                  height: '70cqmin',
                  fontSize: '2.2cqmin',
                }}
              >
                <AnalysisItem
                  item={localization[language].searchItem}
                  language={language}
                  learn={localization[language].learnButton}
                  example={localization[language].example}
                  style={{ fontSize: '2.8cqmin' }}
                  hideExamples
                  highlightLearn={false}
                />
              </ChromeExtension>
            </Bottom>
          </Placeholder>
        </Screenshot>
        <Screenshot>
          <Placeholder format={format} fixedTitle titleTop={0.08}>
            <Heading
              title={localization[language].learn}
              sub={localization[language].learnSub}
            />
            <Bottom>
              <ChromeWindow
                url="app.vocably.pro"
                title="Vocably"
                style={{
                  width: '128cqmin',
                  height: '70cqmin',
                  fontSize: '2.2cqmin',
                }}
              >
                <MultiChoiceQuestion
                  item={localization[language].searchItem}
                  incorrect={localization[language].incorrectTranslations}
                  language={language}
                  style={{
                    width: '60cqmin',
                    margin: '4cqmin auto 0',
                    fontSize: '3cqmin',
                  }}
                  hideExamples
                />
              </ChromeWindow>
            </Bottom>
          </Placeholder>
        </Screenshot>
        <Screenshot>
          <Placeholder format={format} fixedTitle titleTop={0.08}>
            <Heading
              title={localization[language].customLists}
              sub={localization[language].customListsSub}
            />
            <CardList
              prompt={localization[language].customListsPrompt}
              cards={localization[language].customListsCards}
              style={{ width: '70cqmin', fontSize: '3.2cqmin' }}
            />
          </Placeholder>
        </Screenshot>
      </>
    )}
  </Device>
);
