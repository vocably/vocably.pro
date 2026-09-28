import { Device, Screenshot } from '../Device';
import { getFormat } from '../formats';
import { Languages } from '../components/Languages';
import { Logo } from '../components/Logo';
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
            <Logo className="logo" style={{ width: '25cqmin' }} />
            <div className="title">
              {localization[language].featureGraphicTitle}
            </div>
            <Languages
              {...flags[language]}
              columns={flags[language].languages.length}
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
