import type { AnalysisItem } from '@vocably/model';
import { languageTranslations } from '@vocably/i18n';
import type { Language } from '../languages';
import { inputBg, muted, onBackground, secondary } from './mobileTheme';

// Material "play-circle", as PlaySound draws it.
const PlayIcon = ({ size, opacity }: { size: string; opacity: number }) => (
  <svg
    viewBox="0 0 24 24"
    fill={onBackground}
    style={{
      display: 'inline-block',
      width: size,
      height: size,
      flexShrink: 0,
      opacity,
    }}
  >
    <path d="M10,16.5V7.5L16,12M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
  </svg>
);

// mobile-app/src/Tag.tsx
const Tag = ({ children }: { children: string }) => (
  <span
    style={{
      padding: '0.125em 0.625em 0.25em',
      borderRadius: '0.75em',
      background: inputBg,
      fontSize: '0.8125em',
      fontWeight: 500,
      letterSpacing: '0.0231em',
      lineHeight: '1.2308em',
      color: muted,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </span>
);

type Props = {
  // The card being studied.
  item: AnalysisItem;
  // The interface language, which the part of speech is written in.
  language: Language;
  // Leaves the examples out, for formats with little room.
  hideExamples?: boolean;
};

// The front of a study card: the word, its IPA, tags and examples
// (mobile-app/src/study/Card/CardFront.tsx). Sized in em of its parent.
export const CardFront = ({ item, language, hideExamples = false }: Props) => {
  // Falls back to the untranslated value, like the mobile app does.
  const partOfSpeech =
    item.partOfSpeech &&
    (languageTranslations[language][item.partOfSpeech] ?? item.partOfSpeech);
  const examples = hideExamples ? [] : (item.examples ?? []);

  const tags = [partOfSpeech, item.g].filter(Boolean) as string[];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25em' }}>
        <PlayIcon size="1.5em" opacity={0.5} />
        <span
          style={{
            fontSize: '2.125em',
            fontWeight: 600,
            letterSpacing: '-0.0088em',
            color: secondary,
          }}
        >
          {item.source}
        </span>
      </div>

      {(item.ipa || tags.length > 0) && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '0.5em',
            marginTop: '0.225em',
          }}
        >
          {item.ipa && (
            <span style={{ color: muted }}>
              /{item.ipa.replace(/[/[\]]/g, '')}/
            </span>
          )}
          {tags.map((tag, index) => (
            <Tag key={index}>{tag}</Tag>
          ))}
        </div>
      )}

      {examples.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.375em',
            marginTop: '1.25em',
            fontSize: '1.125em',
          }}
        >
          {examples.map((example, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.25em',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  height: '1.3em',
                }}
              >
                <PlayIcon size="1em" opacity={0.2} />
              </span>
              <span>{example}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
