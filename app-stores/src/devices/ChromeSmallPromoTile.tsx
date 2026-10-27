import { Device, Screenshot } from '../Device';
import { getFormat } from '../formats';
import { Languages } from '../components/Languages';
import { Logo } from '../components/Logo';
import { flags } from '../flags';
import { localization } from '../localization';
import { Placeholder } from '../templates/Placeholder';

const format = getFormat('cws-small-promo-tile');

export const ChromeSmallPromoTile = () => (
  <Device format={format}>
    {(language) => (
      <>
        <Screenshot>
          <Placeholder format={format} paddingInline={format.width * 0.06}>
            <Logo className="logo" style={{ width: '55cqmin' }} />
            <Languages
              {...flags[language]}
              columns={flags[language].languages.length}
              size={Math.min(format.width, format.height) * 0.1}
            />
            <div className="subtitle" style={{ fontSize: '9cqmin' }}>
              {localization[language].languageCount}
            </div>
          </Placeholder>
        </Screenshot>
      </>
    )}
  </Device>
);
