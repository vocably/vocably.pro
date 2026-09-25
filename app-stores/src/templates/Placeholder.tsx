import { useLayoutEffect, useRef, type ReactNode } from 'react';
import type { AssetFormat } from '../formats';
import { useTitleTop } from '../TitleTop';

type Props = {
  format: AssetFormat;
  // 'anchor': the content is centered, and the position of its `.title` is
  // shared with the other screenshots of the language.
  // 'align': the content starts at the anchor title position, so the title
  // leading the content lines up with the anchor one.
  title?: 'anchor' | 'align';
  children?: ReactNode;
};

export const Placeholder = ({ format, title, children }: Props) => {
  const minSide = Math.min(format.width, format.height);
  const rootRef = useRef<HTMLDivElement>(null);
  const { top, setTop } = useTitleTop();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (title !== 'anchor' || !root) return;

    const measure = () => {
      const titleNode = root.querySelector('.title');
      if (!titleNode) return;
      const rootRect = root.getBoundingClientRect();
      // The canvas is scaled down for the preview; convert back to format px.
      const scale = rootRect.height / root.offsetHeight;
      setTop((titleNode.getBoundingClientRect().top - rootRect.top) / scale);
    };

    measure();
    // Centered content moves whenever any part of it resizes (fonts, text…).
    const observer = new ResizeObserver(measure);
    for (const child of root.children) observer.observe(child);
    return () => observer.disconnect();
  }, [title, setTop]);

  const aligned = title === 'align' && top !== null;

  return (
    <div
      ref={rootRef}
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: aligned ? 'flex-start' : 'center',
        padding: minSide * 0.06,
        paddingTop: aligned ? top : minSide * 0.06,
        gap: minSide * 0.08,
        background: '#fff',
        color: 'rgb(106, 106, 106)',
        fontFamily: "'Roboto', sans-serif",
        fontWeight: '400',
      }}
    >
      {children}
    </div>
  );
};
