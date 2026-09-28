import { createContext, useContext, type ReactNode } from 'react';
import { Canvas } from './Canvas';
import { type AssetFormat } from './formats';
import { languageNames, languages, type Language } from './languages';

const PREVIEW_HEIGHT = 480;

const previewScale = (format: AssetFormat) =>
  Math.min(PREVIEW_HEIGHT / format.height, 1);

const FormatContext = createContext<AssetFormat | null>(null);

type DeviceProps = {
  format: AssetFormat;
  // Defaults to every interface language.
  languages?: readonly Language[];
  // Renders the screenshots of one language, in the order they are exported.
  children: (language: Language) => ReactNode;
};

// Renders a group of screenshots per language.
// `data-language` marks the group that becomes a folder in the exported ZIP.
export const Device = ({
  format,
  languages: deviceLanguages = languages,
  children,
}: DeviceProps) => (
  <FormatContext value={format}>
    {deviceLanguages.map((language) => (
      <section
        key={language}
        className="language-group"
        data-language={language}
      >
        <h3>
          {languageNames[language]} <small>{language}</small>
        </h3>
        <div
          className="screenshots"
          // Space the previews like the store does, so panoramas line up.
          style={
            format.gap === undefined
              ? undefined
              : { gap: format.gap * previewScale(format) }
          }
        >
          {children(language)}
        </div>
      </section>
    ))}
  </FormatContext>
);

// One exported PNG. Formats smaller than the preview are never scaled up.
export const Screenshot = ({ children }: { children: ReactNode }) => {
  const format = useContext(FormatContext);
  if (!format) throw new Error('<Screenshot> must be used inside <Device>');

  return (
    <Canvas format={format} scale={previewScale(format)}>
      {children}
    </Canvas>
  );
};
