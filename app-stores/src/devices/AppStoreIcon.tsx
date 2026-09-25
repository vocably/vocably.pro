import { Device, Screenshot } from '../Device';
import { getFormat } from '../formats';
import { Languages } from '../components/Languages';
import { flags } from '../flags';
import { localization } from '../localization';
import { Placeholder } from '../templates/Placeholder';

const format = getFormat('ios-icon');

export const AppStoreIcon = () => (
  <Device format={format}>
    {(language) => (
      <>
        <Screenshot>
          <Placeholder format={format}>
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
      </>
    )}
  </Device>
);
