import { Device, Screenshot } from '../Device';
import { getFormat } from '../formats';
import { Languages } from '../components/Languages';
import { AnalysisItem } from '../components/AnalysisItem';
import { Search } from '../components/Search';
import { MultiChoiceQuestion } from '../components/MultiChoiceQuestion';
import { flags } from '../flags';
import { localization } from '../localization';
import { Placeholder } from '../templates/Placeholder';
import { Logo } from '../components/Logo';
import { SafariExtension } from '../components/SafariExtension';
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
            <Search query={localization[language].search} />
            <AnalysisItem
              item={localization[language].searchItem}
              language={language}
              learn={localization[language].learnButton}
              example={localization[language].example}
              hideExamples
            />
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
            <IPadAir13 width="100%">
              <MultiChoiceQuestion
                style={{ marginTop: '1.6em' }}
                item={localization[language].searchItem}
                incorrect={localization[language].incorrectTranslations}
                language={language}
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
              <div className="title">{localization[language].extension}</div>
              <div className="subtitle">
                {localization[language].extensionSub}
              </div>
            </div>
            <SafariExtension text={localization[language].pageText}>
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
      </>
    )}
  </Device>
);
