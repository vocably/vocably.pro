import { Device, Screenshot } from '../Device';
import { getFormat } from '../formats';
import { Languages } from '../components/Languages';
import { Search } from '../components/Search';
import { flags } from '../flags';
import { localization } from '../localization';
import logo from '../logo.svg?url';
import { Placeholder } from '../templates/Placeholder';

const format = getFormat('play-tablet-10');

export const PlayTablet10 = () => (
  <Device format={format}>
    {(language) => (
      <>
        <Screenshot>
          <Placeholder format={format} label={`${language} · 1`}>
            <img className="logo" src={logo} alt="Vocably" />
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
