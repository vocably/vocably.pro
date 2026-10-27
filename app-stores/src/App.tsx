import { useEffect, useRef, useState } from 'react';
import { devices } from './devices';
import { exportZip } from './exportZip';
import { formats, type Store } from './formats';

const storeNames: Record<Store, string> = {
  'app-store': 'App Store',
  'google-play': 'Google Play',
};

const formatIdFromUrl = () =>
  new URLSearchParams(window.location.search).get('format') ?? formats[0].id;

export const App = () => {
  const [formatId, setFormatId] = useState(formatIdFromUrl);
  const [progress, setProgress] = useState<string | null>(null);
  const screenshotsRef = useRef<HTMLDivElement>(null);

  const format = formats.find((f) => f.id === formatId) ?? formats[0];
  const DeviceScreenshots = devices[format.id];

  useEffect(() => {
    const onPopState = () => setFormatId(formatIdFromUrl());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const selectFormat = (id: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('format', id);
    window.history.pushState(null, '', url);
    setFormatId(id);
  };

  const onExport = async () => {
    if (!screenshotsRef.current) return;
    setProgress('Exporting…');
    try {
      await exportZip(screenshotsRef.current, format, (done, total) =>
        setProgress(`Exporting ${done}/${total}…`)
      );
    } finally {
      setProgress(null);
    }
  };

  return (
    <div className="layout">
      <aside className="sidebar">
        {(Object.keys(storeNames) as Store[]).map((store) => (
          <section key={store}>
            <h2>{storeNames[store]}</h2>
            {formats
              .filter((f) => f.store === store)
              .map((f) => (
                <button
                  key={f.id}
                  className={f.id === format.id ? 'active' : ''}
                  onClick={() => selectFormat(f.id)}
                >
                  <span>{f.name}</span>
                  <small>
                    {f.width}×{f.height}
                  </small>
                </button>
              ))}
          </section>
        ))}
      </aside>
      <main className="preview">
        <div className="toolbar">
          <span>
            {storeNames[format.store]} · {format.name}
          </span>
          <button onClick={onExport} disabled={progress !== null}>
            {progress ?? 'Download ZIP'}
          </button>
        </div>
        <div ref={screenshotsRef} className="device">
          <DeviceScreenshots />
        </div>
      </main>
    </div>
  );
};
