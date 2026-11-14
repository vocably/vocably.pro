import { Device, Screenshot } from '../Device';
import { getFormat } from '../formats';
import { Languages } from '../components/Languages';
import { flags } from '../flags';
import { localization } from '../localization';
import { Placeholder } from '../templates/Placeholder';
import { Accent } from '../components/Accent';

const format = getFormat('ios-search-results');

// On a phone the App Store scales the image up and crops it to a window that
// is centered horizontally but sits above the vertical center: roughly
// 31%–69% of the width and 15%–63% of the height are visible. The content is
// centered inside a slightly smaller safe area within that window.
const SAFE = { left: 0.32, right: 0.68, top: 0.18, bottom: 0.6 };

const minSide = Math.min(format.width, format.height);

export const AppStoreSearchResults = () => (
  <Device format={format} textScale={0.7}>
    {(language) => (
      <Screenshot>
        <Placeholder format={format}>
          <div
            style={{
              position: 'absolute',
              left: format.width * SAFE.left,
              top: format.height * SAFE.top,
              width: format.width * (SAFE.right - SAFE.left),
              height: format.height * (SAFE.bottom - SAFE.top),
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: minSide * 0.02,
            }}
          >
            <div
              className="title"
              // Slightly smaller than .title's 8cqmin.
              style={{ fontSize: 'calc(7cqmin * var(--text-scale, 1))' }}
            >
              <Accent text={localization[language].featureGraphicTitle} />
            </div>
            <Languages
              {...flags[language]}
              columns={flags[language].languages.length}
              size={minSide * 0.05}
            />
            <div className="subtitle">
              {localization[language].languageCount}
            </div>
          </div>
        </Placeholder>
      </Screenshot>
    )}
  </Device>
);
