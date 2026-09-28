type Props = {
  query: string;
};

// The extension's primary color (packages/styles/_variables.scss).
const primary = '#0050ff';

// A mock of the app's search field, focused, with the query just typed in.
// Sized in cqmin, relative to the format.
export const Search = ({ query }: Props) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '3cqmin',
      width: '100%',
      padding: '2cqmin 2cqmin 2cqmin 6cqmin',
      border: `0.5cqmin solid ${primary}`,
      borderRadius: '100cqmin',
      background: '#fff',
      // A focus ring glowing around the field, over a soft drop shadow.
      boxShadow: [
        '0 0 0 1.5cqmin rgba(0, 80, 255, 0.12)',
        '0 0 5cqmin rgba(0, 80, 255, 0.25)',
        '0 2cqmin 5cqmin rgba(0, 0, 0, 0.08)',
      ].join(', '),
      fontSize: '6cqmin',
      fontFamily: "'Roboto', sans-serif",
      fontWeight: 500,
      color: '#1f1f1f',
    }}
  >
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        minWidth: 0,
      }}
    >
      <span
        style={{
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
        }}
      >
        {query}
      </span>
      {/* The text caret, right after the query. */}
      <span
        style={{
          flexShrink: 0,
          width: '0.6cqmin',
          height: '1.2em',
          marginLeft: '0.6cqmin',
          borderRadius: '0.3cqmin',
          background: primary,
        }}
      />
    </div>
    <div
      style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '12cqmin',
        height: '12cqmin',
        borderRadius: '50%',
        background: `linear-gradient(135deg, #3d7bff, ${primary})`,
        boxShadow: '0 1cqmin 3cqmin rgba(0, 80, 255, 0.4)',
        color: '#fff',
      }}
    >
      {/* Material Symbols "search". Inline, so html-to-image embeds it. */}
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        style={{ display: 'block', width: '7cqmin', height: '7cqmin' }}
      >
        <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14" />
      </svg>
    </div>
  </div>
);
