import {
  Children,
  createContext,
  Fragment,
  isValidElement,
  useContext,
  type ReactNode,
} from 'react';
import { Canvas } from './Canvas';
import { type AssetFormat } from './formats';
import { languageNames, languages, type Language } from './languages';
import { PanoramaBackground } from './templates/PanoramaBackground';

const PREVIEW_HEIGHT = 480;

const previewScale = (format: AssetFormat) =>
  Math.min(PREVIEW_HEIGHT / format.height, 1);

const FormatContext = createContext<AssetFormat | null>(null);

// A screenshot's position within its language group.
const SlotContext = createContext({ index: 0, count: 1 });

// The screenshots of a group, with the fragments around them unwrapped.
const flatten = (node: ReactNode): ReactNode[] =>
  Children.toArray(node).flatMap((child) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
      ? flatten(child.props.children)
      : [child]
  );

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
    {deviceLanguages.map((language) => {
      const screenshots = flatten(children(language));
      return (
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
            {screenshots.map((screenshot, index) => (
              <SlotContext
                key={index}
                value={{ index, count: screenshots.length }}
              >
                {screenshot}
              </SlotContext>
            ))}
          </div>
        </section>
      );
    })}
  </FormatContext>
);

// This screenshot's slice of its group's PanoramaBackground, filling the
// nearest positioned ancestor, which must be as big as the canvas.
export const ScreenshotBackground = () => {
  const format = useContext(FormatContext);
  const { index, count } = useContext(SlotContext);
  if (!format)
    throw new Error('<ScreenshotBackground> must be used inside <Device>');

  return <PanoramaBackground format={format} index={index} count={count} />;
};

// One exported PNG. Formats smaller than the preview are never scaled up.
// It shows its slice of the group's PanoramaBackground behind its content.
export const Screenshot = ({ children }: { children: ReactNode }) => {
  const format = useContext(FormatContext);
  if (!format) throw new Error('<Screenshot> must be used inside <Device>');

  return (
    <Canvas format={format} scale={previewScale(format)}>
      <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
        <ScreenshotBackground />
        <div style={{ position: 'relative', height: '100%' }}>{children}</div>
      </div>
    </Canvas>
  );
};
