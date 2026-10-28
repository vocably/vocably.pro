import { Device, Screenshot } from '../Device';
import { getFormat } from '../formats';
import { Logo } from '../components/Logo';
import { Placeholder } from '../templates/Placeholder';
import { localization } from '../localization';
import { Languages } from '../components/Languages.tsx';
import { flags } from '../flags.ts';

const format = getFormat('ios-header');

export const AppStoreHeader = () => (
  <Device format={format}>
    {(language) => (
      <>
        <Screenshot>
          <Placeholder format={format}>
            {/* The block's center sits at a third of the height. The title, flags
                and subtitle fit its width. */}
            <div
              style={{
                position: 'absolute',
                top: '40%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2cqmin',
              }}
            >
              <Logo className="logo" style={{ width: '19cqmin' }} />
              {/*<div className="title" style={{ fontSize: '3.6cqmin' }}>*/}
              {/*  {localization[language].iosHeaderTitle}*/}
              {/*</div>*/}
              {/*<Languages*/}
              {/*  {...flags[language]}*/}
              {/*  columns={flags[language].languages.length}*/}
              {/*  size={Math.min(format.width, format.height) * 0.025}*/}
              {/*/>*/}
              {/*<div className="subtitle" style={{ fontSize: '2.7cqmin' }}>*/}
              {/*  {localization[language].languageCount}*/}
              {/*</div>*/}
            </div>
          </Placeholder>
        </Screenshot>
      </>
    )}
  </Device>
);
