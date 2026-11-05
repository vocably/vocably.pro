import { Device, Screenshot } from '../Device';
import { getFormat } from '../formats';
import { Accent } from '../components/Accent';
import { Languages } from '../components/Languages';
import { flags } from '../flags';
import { localization } from '../localization';
import { Placeholder } from '../templates/Placeholder';

const format = getFormat('play-feature-graphic');

export const PlayFeatureGraphic = () => (
  <Device format={format}>
    {(language) => (
      <>
        <Screenshot>
          <Placeholder format={format} paddingInline={format.width * 0.12}>
            <div className="title" style={{ fontSize: '9cqmin' }}>
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
