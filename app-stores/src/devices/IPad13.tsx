import { Device, Screenshot } from '../Device';
import { getFormat } from '../formats';
import { Languages } from '../components/Languages';
import { AnalysisItem } from '../components/AnalysisItem';
import { Search } from '../components/Search';
import { flags } from '../flags';
import { localization } from '../localization';
import logo from '../logo.svg?url';
import { Placeholder } from '../templates/Placeholder';

const format = getFormat('ios-ipad-13');

export const IPad13 = () => (
  <Device format={format}>
    {(language) => (
      <>
        <Screenshot>
          <Placeholder format={format} label={`${language} · 1`}>
            <img className="logo" src={logo} alt="Vocably" />
            <div className="title" style={{ fontSize: '8cqmin' }}>
              {localization[language].title}
            </div>
            <Languages
              {...flags[language]}
              size={Math.min(format.width, format.height) * 0.14}
              locale={language}
            />
            <div className="subtitle">
              {localization[language].languageCount}
            </div>
          </Placeholder>
        </Screenshot>
        <Screenshot>
          <Placeholder format={format} label={`${language} · 2`}>
            <Search query={localization[language].search} />
            <AnalysisItem
              item={localization[language].searchItem}
              language={language}
              learn={localization[language].learn}
              example={localization[language].example}
            />
          </Placeholder>
        </Screenshot>
        <Screenshot>
          <Placeholder format={format} label={`${language} · 3`} />
        </Screenshot>
      </>
    )}
  </Device>
);
