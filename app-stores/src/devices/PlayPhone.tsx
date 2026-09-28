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
import { Logo } from '../components/Logo.tsx';
import { Pixel9Pro } from '../components/Pixel9Pro';
import { AndroidSelection } from '../components/AndroidSelection';

const format = getFormat('play-phone');

export const PlayPhone = () => (
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
            <Pixel9Pro
              width="100%"
              style={{
                transform: 'scale(0.85)',
                transformOrigin: 'top center',
              }}
            >
              <MultiChoiceQuestion
                style={{ marginTop: '2em' }}
                item={localization[language].searchItem}
                incorrect={localization[language].incorrectTranslations}
                language={language}
              />
            </Pixel9Pro>
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
                {localization[language].androidExtension}
              </div>
              <div className="subtitle">
                {localization[language].androidExtensionSub}
              </div>
            </div>
            <AndroidSelection
              style={{ marginTop: '12cqmin' }}
              text={localization[language].pageText}
              webSearch={localization[language].webSearch}
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
              <div className="title">{localization[language].customLists}</div>
              <div className="subtitle">
                {localization[language].customListsSub}
              </div>
            </div>
            <CardList
              prompt={localization[language].customListsPrompt}
              cards={localization[language].customListsCards}
            />
          </Placeholder>
        </Screenshot>
      </>
    )}
  </Device>
);
