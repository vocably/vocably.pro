import { useLayoutEffect, useState } from 'react';
import type { RefObject } from 'react';

// How far the popup's tail has to move from the popup's center to point at
// the middle of the word inside `target`. The word sits at a different spot
// in every language, so it is measured after every render and again once
// the fonts have loaded.
export const useTailOffset = (
  target: RefObject<HTMLElement | null>,
  popup: RefObject<HTMLElement | null>
) => {
  const [tailOffset, setTailOffset] = useState('0px');

  useLayoutEffect(() => {
    let active = true;
    const measure = () => {
      const word = target.current?.querySelector('[data-word]');
      if (!active || !word || !popup.current) {
        return;
      }
      const w = word.getBoundingClientRect();
      const p = popup.current.getBoundingClientRect();
      // The preview scales the canvas down; offsetWidth is unscaled.
      const scale = p.width / popup.current.offsetWidth;
      const offset = (w.left + w.width / 2 - (p.left + p.width / 2)) / scale;
      setTailOffset(`${offset}px`);
    };
    measure();
    document.fonts.ready.then(measure);
    return () => {
      active = false;
    };
    // No dependencies: it re-measures after every render, so moving or
    // resizing either element keeps the tail on the word. Once the offset
    // settles, setting the same string again does not re-render.
  });

  return tailOffset;
};
