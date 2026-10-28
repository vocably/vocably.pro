// The extension's primary color (packages/styles/_variables.scss).
const primary = '#0050ff';

// Shows text with its *words between asterisks* in the primary color, kept
// on one line, so Chinese doesn't break inside them.
export const Accent = ({ text }: { text: string }) => (
  <>
    {text.split('*').map((part, index) =>
      index % 2 === 1 ? (
        <span key={index} style={{ color: primary, whiteSpace: 'nowrap' }}>
          {part}
        </span>
      ) : (
        part
      )
    )}
  </>
);
