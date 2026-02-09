import { GoogleLanguage } from '@vocably/model';
import { api } from './api';
import { setContents, TearDown } from './popup/contents';
import { GlobalRect } from './position';
import {
  applyMaxZIndex,
  applyPosition,
  applyTransform,
  isTop,
  Position,
  setupTransform,
} from './styling';

type PopupStackItem = {
  overlay: HTMLVocablyOverlayElement;
  resizeObserver: ResizeObserver;
  tearDownContents: TearDown;
};

const popupStack: PopupStackItem[] = [];

const calculatePosition = (
  globalRect: GlobalRect,
  isTouchscreen: boolean
): Position => {
  const left =
    window.innerWidth < 640
      ? window.scrollX + window.innerWidth / 2
      : globalRect.left + globalRect.width / 2;

  const top = globalRect.top - window.scrollY;
  const bottom = top + globalRect.height;
  const selectionContextMenuHeight = Math.ceil(
    50 / (window?.visualViewport?.scale ?? 1)
  );

  if (bottom < window.innerHeight / 2) {
    return {
      left,
      top:
        window.scrollY +
        bottom +
        (isTouchscreen ? selectionContextMenuHeight : 0),
    };
  } else {
    return {
      left,
      bottom:
        window.scrollY + top - (isTouchscreen ? selectionContextMenuHeight : 0),
    };
  }
};

const calculateMaxHeight = (position: Position): string => {
  if (isTop(position)) {
    return `${window.scrollY - position.top + window.innerHeight}px`;
  } else {
    return `${position.bottom - window.scrollY}px`;
  }
};

const applyInitialStyles = (popup: HTMLElement) => {
  applyMaxZIndex(popup);
  popup.style.opacity = '0';
  popup.style.transition = 'opacity 100ms';
};

const show = (popup: HTMLElement) => {
  popup.style.opacity = '1';
};

type PopupOptions = {
  text: string;
  context?: string;
  detectedLanguage?: GoogleLanguage;
  globalRect: GlobalRect;
  isTouchscreen: boolean;
  initiator?: string;
};

export const popupAlreadyExists = (text: string) => {
  const lastPopup = [...document.querySelectorAll('vocably-popup')].pop();
  if (!lastPopup) {
    return false;
  }

  return lastPopup.dataset.text === text;
};

export const createPopup = async (options: PopupOptions) => {
  const popup = document.createElement('vocably-popup');
  popup.dataset.text = options.text;

  const { autoPlay } = await api.getSettings();

  const tearDownContents = await setContents({
    popup,
    source: options.text,
    detectedLanguage: options.detectedLanguage,
    context: options.context,
    autoPlay,
    initiator: options.initiator,
  });

  const position = calculatePosition(options.globalRect, options.isTouchscreen);

  popup.style.setProperty('--max-height', calculateMaxHeight(position));
  popup.style.setProperty(
    '--max-width',
    `${window?.visualViewport?.width ?? 200}px`
  );
  applyPosition(popup, position);
  setupTransform(popup);
  show(popup);

  const resizeObserver = new ResizeObserver(() => {
    requestAnimationFrame(() => applyTransform(popup, position));
  });
  resizeObserver.observe(popup);

  const overlay = document.createElement('vocably-overlay');
  overlay.style.setProperty('--backdropOpacity', '0');
  overlay.closeKeyCode = ['Escape', 'Space'];
  overlay.appendChild(popup);

  overlay.addEventListener('close', () => {
    destroyOverlay(overlay);
  });

  document.body.appendChild(overlay);

  popupStack.push({ overlay, resizeObserver, tearDownContents });
};

export const destroyOverlay = (overlayToDestroy: HTMLVocablyOverlayElement) => {
  const stackItemIndex = popupStack.findIndex(
    (item) => item.overlay === overlayToDestroy
  );

  if (stackItemIndex === -1) {
    return;
  }

  const { overlay, resizeObserver, tearDownContents } =
    popupStack[stackItemIndex];

  tearDownContents();
  resizeObserver.unobserve(overlay);
  resizeObserver.disconnect();
  overlay.hide();

  popupStack.splice(stackItemIndex, 1);
};

export const destroyAllOverlays = () => {
  while (popupStack.length > 0) {
    destroyOverlay(popupStack[0].overlay);
  }
};
