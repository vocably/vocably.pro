import { Device, Screenshot } from '../Device';
import { getFormat } from '../formats';
import { Languages } from '../components/Languages';
import { flags } from '../flags';
import { Placeholder } from '../templates/Placeholder';

const format = getFormat('ios-icon');

export const AppStoreIcon = () => (
  <Device format={format}>
    {(language) => (
      <>
        <Screenshot>
          <Placeholder format={format} label={`${language} · 1`}>
            <Languages
              {...flags[language]}
              size={Math.min(format.width, format.height) * 0.14}
              locale={language}
            />
          </Placeholder>
        </Screenshot>
      </>
    )}
  </Device>
);
