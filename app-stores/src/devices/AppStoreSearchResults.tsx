import { Device, Screenshot } from '../Device';
import { getFormat } from '../formats';
import { Languages } from '../components/Languages';
import { flags } from '../flags';
import { localization } from '../localization';
import { Placeholder } from '../templates/Placeholder';
import { Accent } from '../components/Accent';

const format = getFormat('ios-search-results');

// On a phone the App Store scales the image up and crops its sides, so the
// content is kept inside the middle SAFE_WIDTH of the canvas.
const SAFE_WIDTH = 0.6;

export const AppStoreSearchResults = () => (
  <Device format={format} textScale={0.7}>
    {(language) => (
      <>
        <Screenshot>
          <Placeholder
            format={format}
            paddingInline={(format.width * (1 - SAFE_WIDTH)) / 2}
            gap={Math.min(format.width, format.height) * 0.04}
          >
            <div className="title">
              <Accent text={localization[language].featureGraphicTitle} />
            </div>
            <Languages
              {...flags[language]}
              columns={flags[language].languages.length}
              size={Math.min(format.width, format.height) * 0.06}
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
