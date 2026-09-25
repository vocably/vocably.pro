import '@fontsource/roboto/400.css';

type Props = {
  query: string;
};

// A mock of the app's search field. Sized in cqmin, relative to the format.
export const Search = ({ query }: Props) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '3cqmin',
      width: '90%',
      padding: '3.5cqmin 5cqmin',
      borderRadius: '4cqmin',
      background: 'rgba(0, 0, 0, 0.04)',
      fontSize: '6cqmin',
      fontFamily: "'Roboto', sans-serif",
      color: '#6a6a6a',
    }}
  >
    <div
      style={{
        flex: 1,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
      }}
    >
      {query}
    </div>
    {/* Material Symbols "search". Inline, so html-to-image embeds it. */}
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      style={{ display: 'block', width: '8cqmin', height: '8cqmin' }}
    >
      <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14" />
    </svg>
  </div>
);
