import { Device, Screenshot } from '../Device';
import { getFormat } from '../formats';
import { Languages } from '../components/Languages';
import { AnalysisItem } from '../components/AnalysisItem';
import { Search } from '../components/Search';
import { MultiChoiceQuestion } from '../components/MultiChoiceQuestion';
import { flags } from '../flags';
import { localization } from '../localization';
import { Placeholder } from '../templates/Placeholder';
import { CardList } from '../components/CardList';
import { DesktopBrowsers } from '../components/DesktopBrowsers';
import { Logo } from '../components/Logo';
import { SafariExtension } from '../components/SafariExtension';
import { SafariCorner } from '../components/SafariIcon';
import { IPadAir13 } from '../components/IPadAir13';

const format = getFormat('ios-ipad-13');

export const IPad13 = () => (
  <Device format={format}>
    {(language) => (
      <>
        <Screenshot>
          <Placeholder format={format}>
            <Logo className="logo" />
            <div className="title">{localization[language].title}</div>
            <Languages
              {...flags[language]}
              size={Math.min(format.width, format.height) * 0.14}
            />
            <div className="subtitle">
              {localization[language].languageCount}
            </div>
          </Placeholder>
        </Screenshot>
        <Screenshot>
          <Placeholder format={format} fixedTitle titleTop={0.1}>
            <div style={{ textAlign: 'center' }}>
              <div className="title">{localization[language].translate}</div>
              <div className="subtitle">
                {localization[language].translateSub}
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8cqmin',
                width: '100%',
                marginTop: 'auto',
                marginBottom: '20cqmin',
              }}
            >
              <Search query={localization[language].search} />
              <AnalysisItem
                item={localization[language].searchItem}
                language={language}
                learn={localization[language].learnButton}
                example={localization[language].example}
                hideExamples
              />
            </div>
          </Placeholder>
        </Screenshot>
        <Screenshot>
          <Placeholder format={format} fixedTitle titleTop={0.1}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2.4em',
              }}
            >
              <div className="title">{localization[language].learn}</div>
              <div className="subtitle">{localization[language].learnSub}</div>
            </div>
            <IPadAir13
              width="100%"
              // Scaled down so the whole frame fits above the canvas bottom.
              style={{ transform: 'scale(0.7)', transformOrigin: 'top center' }}
            >
              <MultiChoiceQuestion
                style={{ marginTop: '1.6em' }}
                item={localization[language].searchItem}
                incorrect={localization[language].incorrectTranslations}
                language={language}
                hideLastAnswer={language === 'en'}
                hideExamples
              />
            </IPadAir13>
          </Placeholder>
        </Screenshot>
        <Screenshot>
          <Placeholder format={format} fixedTitle titleTop={0.1}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2.4em',
              }}
            >
              <div className="title">{localization[language].customLists}</div>
              <div className="subtitle">
                {localization[language].customListsSub}
              </div>
            </div>
            <CardList
              prompt={localization[language].customListsPrompt}
              cards={localization[language].customListsCards}
              style={{ width: '75%', fontSize: '4cqmin' }}
            />
          </Placeholder>
        </Screenshot>
        <Screenshot>
          <Placeholder
            format={format}
            fixedTitle
            titleTop={0.1}
            backdrop={<SafariCorner offset={[15, 13]} />}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2.4em',
              }}
            >
              <div className="title">{localization[language].extension}</div>
              <div className="subtitle">
                {localization[language].extensionSub}
              </div>
            </div>
            <SafariExtension
              text={localization[language].pageText}
              style={{
                transform: language === 'en' ? 'scale(0.85)' : 'scale(1)',
                transformOrigin: 'top center',
                marginTop: language === 'en' ? '0cqmin' : '2cqmin',
              }}
            >
              <AnalysisItem
                item={localization[language].searchItem}
                language={language}
                learn={localization[language].learnButton}
                example={localization[language].example}
                hideExamples
                highlightLearn={false}
              />
            </SafariExtension>
          </Placeholder>
        </Screenshot>
        <Screenshot>
          <Placeholder format={format} fixedTitle titleTop={0.1}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2.4em',
              }}
            >
              <div className="title">
                {localization[language].desktopExtension}
              </div>
              <div className="subtitle">
                {localization[language].desktopExtensionSub}
              </div>
            </div>
            <DesktopBrowsers style={{ marginBottom: '10cqmin' }} />
          </Placeholder>
        </Screenshot>
      </>
    )}
  </Device>
);
