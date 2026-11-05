import { Device, Screenshot } from '../Device';
import { getFormat } from '../formats';
import { Languages } from '../components/Languages';
import { flags } from '../flags';
import { localization } from '../localization';
import { Placeholder } from '../templates/Placeholder';
import { Accent } from '../components/Accent';

const format = getFormat('ios-search-results');

export const AppStoreSearchResults = () => (
  <Device format={format}>
    {(language) => (
      <>
        <Screenshot>
          <Placeholder format={format}>
            <div className="title">
              <Accent text={localization[language].featureGraphicTitle} />
            </div>
            <Languages
              {...flags[language]}
              columns={flags[language].languages.length}
              size={Math.min(format.width, format.height) * 0.09}
            />
            <div className="subtitle">
              {localization[language].languageCount}
            </div>
          </Placeholder>
        </Screenshot>
      </>
    )}
  </Device>
);
