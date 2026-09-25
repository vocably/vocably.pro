import { Device, Screenshot } from '../Device';
import { getFormat } from '../formats';
import { Languages } from '../components/Languages';
import { Search } from '../components/Search';
import { flags } from '../flags';
import { localization } from '../localization';
import logo from '../logo.svg?url';
import { Placeholder } from '../templates/Placeholder';

const format = getFormat('ios-iphone-6.5');

export const IPhone65 = () => (
  <Device format={format}>
    {(language) => (
      <>
        <Screenshot>
          <Placeholder format={format} label={`${language} · 1`}>
            <img
              className="logo"
              style={{ width: '35cqmin' }}
              src={logo}
              alt="Vocably"
            />
            <div className="title">{localization[language].title}</div>
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
          </Placeholder>
        </Screenshot>
        <Screenshot>
          <Placeholder format={format} label={`${language} · 3`} />
        </Screenshot>
      </>
    )}
  </Device>
);
