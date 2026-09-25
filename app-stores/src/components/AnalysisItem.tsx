import '@fontsource/roboto/400.css';
import '@fontsource/roboto/700.css';
import type { CSSProperties, ReactNode } from 'react';
import type { AnalysisItem as AnalysisItemType } from '@vocably/model';
import { languageTranslations } from '@vocably/i18n';
import type { Language } from '../languages';

// Colors of the extension's light theme (packages/styles/_variables.scss).
const primary = '#0050ff';
const body = '#6a6a6a';
const muted = '#bababa';
const emphasize = '#000000';

type Props = {
  item: AnalysisItemType;
  // The interface language, which the part of speech is written in.
  language: Language;
  // The add button text, `translation.learn` in the extension.
  learn: string;
  // The examples label, `translation.example` in the extension.
  example: string;
  // Leaves the examples out, for formats with little room.
  hideExamples?: boolean;
};

// Every size is in em, relative to the root font size, which stands for the
// extension's 16px. So the whole card scales with the one `fontSize` below.
const small: CSSProperties = { fontSize: '0.9em' };

// A place the line can break at, with no width of its own. The extension
// puts a zero width `vocably-invisible-space` before each part for the same.
const breakable = '\u200b';

const Muted = ({ children }: { children: ReactNode }) => (
  <>
    {breakable}
    <span style={{ ...small, color: muted, marginLeft: '0.5em' }}>
      {children}
    </span>
  </>
);

type ListItem = {
  label: string;
  style?: CSSProperties;
};

const List = ({ items }: { items: ListItem[] }) => (
  <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
    {items.map(({ label, style }, index) => (
      <li key={index} style={{ position: 'relative', paddingLeft: '1.125em' }}>
        <span
          style={{
            position: 'absolute',
            left: '0.375em',
            top: 0,
            fontSize: '1.125em',
          }}
        >
          •
        </span>
        <span style={style}>{label}</span>
      </li>
    ))}
  </ul>
);

// A static copy of a card of the extension's `vocably-translation-cards`, for
// an item /analyze returns. Only the parts a not yet added card shows.
export const AnalysisItem = ({
  item,
  language,
  learn,
  example,
  hideExamples = false,
}: Props) => {
  // Falls back to the untranslated value, like the mobile app does.
  const partOfSpeech =
    item.partOfSpeech &&
    (languageTranslations[language][item.partOfSpeech] ?? item.partOfSpeech);
  const past = item.tense !== 'past' && item.pastTenses;
  const examples: ListItem[] = hideExamples
    ? []
    : (item.examples ?? []).map((label) => ({ label }));
  const definitions: ListItem[] = [
    { label: item.translation, style: { fontStyle: 'italic' } },
    ...item.definitions.map((label) => ({ label })),
  ].filter(({ label }) => label);

  return (
    <div
      style={{
        position: 'relative',
        width: '90%',
        fontFamily: "'Roboto', sans-serif",
        fontSize: '4.5cqmin',
        lineHeight: 1.25,
        color: body,
      }}
    >
      {/* The "Learn" button of a card that is not in the deck yet. */}
      <div
        style={{
          position: 'absolute',
          top: '-0.3em',
          right: 0,
          display: 'inline-flex',
          alignItems: 'center',
          height: '2em',
          paddingLeft: '0.125em',
          paddingRight: '0.5em',
          border: `0.094em solid ${primary}`,
          borderRadius: '1em',
          background: '#ffffff',
          boxShadow: '0 0 0.75em rgba(0, 80, 255, 0.35)',
          color: primary,
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          style={{ display: 'block', width: '1.5em', height: '1.5em' }}
        >
          <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
        </svg>
        <span style={{ marginLeft: '0.125em' }}>{learn}</span>
      </div>

      <div style={{ paddingRight: '2.125em' }}>
        <div style={{ paddingRight: '3.125em', marginBottom: '0.375em' }}>
          {/* vocably-icon-play-circle */}
          <svg
            viewBox="0 0 24 24"
            fill={muted}
            style={{
              width: '1.125em',
              height: '1.125em',
              marginRight: '0.25em',
              verticalAlign: 'middle',
              opacity: 0.8,
            }}
          >
            <path d="M10,16.5V7.5L16,12M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
          </svg>
          <span style={{ color: emphasize, fontWeight: 'bold' }}>
            {item.source}
          </span>
          {item.ipa && (
            <>
              {breakable}
              {/* nowrap, otherwise the line breaks at the stress mark. */}
              <span
                style={{
                  color: muted,
                  marginLeft: '0.5em',
                  whiteSpace: 'nowrap',
                }}
              >
                /{item.ipa.replace(/[/[\]]/g, '')}/
              </span>
            </>
          )}
          {item.g && <Muted>({item.g})</Muted>}
          {partOfSpeech && <Muted>{partOfSpeech}</Muted>}
          {item.presentTenses && (
            <>
              {past && <br />}
              <Muted>(present: {item.presentTenses})</Muted>
            </>
          )}
          {past && (
            <>
              {item.presentTenses && <br />}
              <Muted>(past: {past})</Muted>
            </>
          )}
          {item.number === 'singular' &&
            item.pluralForm &&
            item.pluralForm !== 'n/a' && (
              <>
                <br />
                <Muted>(plural: {item.pluralForm})</Muted>
              </>
            )}
        </div>

        <div style={{ marginBottom: '0.375em' }}>
          {definitions.length === 1 ? (
            <span style={definitions[0].style}>{definitions[0].label}</span>
          ) : (
            <List items={definitions} />
          )}
        </div>

        {examples.length > 0 && (
          <div>
            <div style={{ ...small, marginBottom: '0.375em' }}>{example}</div>
            {examples.length === 1 ? (
              examples[0].label
            ) : (
              <List items={examples} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
