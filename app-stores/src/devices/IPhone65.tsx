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
import { SafariCorner } from '../components/SafariIcon';
import { IPhone16Max } from '../components/IPhone16Max';

const format = getFormat('ios-iphone-6.5');

export const IPhone65 = () => (
  <Device format={format}>
    {(language) => (
      <>
        <Screenshot>
          <Placeholder format={format}>
            <Logo className="logo" />
            <div className="title">{localization[language].title}</div>
            <Languages
              {...flags[language]}
              size={Math.min(format.width, format.height) * 0.16}
            />
            <div className="subtitle">
              {localization[language].languageCount}
            </div>
          </Placeholder>
        </Screenshot>
        <Screenshot>
          <Placeholder format={format} fixedTitle>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2.4em',
              }}
            >
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
            />
          </Placeholder>
        </Screenshot>
        <Screenshot>
          <Placeholder format={format} fixedTitle>
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
            <IPhone16Max width="100%">
              <MultiChoiceQuestion
                style={{ marginTop: '2em' }}
                item={localization[language].searchItem}
                incorrect={localization[language].incorrectTranslations}
                language={language}
              />
            </IPhone16Max>
          </Placeholder>
        </Screenshot>
        <Screenshot>
          <Placeholder format={format} fixedTitle backdrop={<SafariCorner />}>
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
              style={{ marginTop: language === 'en' ? '10cqmin' : '14cqmin' }}
              text={localization[language].pageText}
            >
              <AnalysisItem
                item={localization[language].searchItem}
                language={language}
                learn={localization[language].learnButton}
                example={localization[language].example}
                highlightLearn={false}
              />
            </SafariExtension>
          </Placeholder>
        </Screenshot>
      </>
    )}
  </Device>
);
