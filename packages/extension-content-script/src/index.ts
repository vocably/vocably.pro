import { browser } from '@vocably/browser';
import { defineCustomElements } from '@vocably/extension-content-ui/loader';
import '@webcomponents/custom-elements';
import { map, merge, Subject, take, timer } from 'rxjs';
import { api, ApiConfigOptions, configureApi } from './api';
import { browserEnv } from './browserEnv';
import { createButton, destroyButton } from './button';
import {
  configureContentScript,
  contentScriptConfiguration,
  ContentScriptConfiguration,
} from './configuration';
import { contextLanguages } from './contextLanguages';
import { detectLanguage } from './detectLanguage';
import { getContext } from './getContext';
import { getText } from './getText';
import { createPopup, destroyAllOverlays, popupAlreadyExists } from './popup';
import { getGlobalRect } from './position';
import { getSelection, isValidSelection } from './selection';
import { initYoutube, InitYouTubeOptions } from './youtube';

type RegisterContentScriptOptions = {
  api: ApiConfigOptions;
  youTube: InitYouTubeOptions;
  contentScript: Partial<ContentScriptConfiguration>;
};

const onCreateSelectionTimeout = async () => {
  try {
    await api.ping();
  } catch {
    return;
  }

  destroyButton();

  const selection = getSelection();
  if (!isValidSelection(selection)) {
    return;
  }

  await createButton(selection);
};

let createSelectionTimeout: ReturnType<typeof setTimeout> | null = null;

const onTextSelect = async () => {
  if (createSelectionTimeout) {
    clearTimeout(createSelectionTimeout);
    createSelectionTimeout = null;
  }

  createSelectionTimeout = setTimeout(onCreateSelectionTimeout, 500);
};

let selectionFixIntervalId: ReturnType<typeof setInterval> | null = null;

const enableSelectionChangeDetection = () => {
  if (!contentScriptConfiguration.displayMobileLookupButton) {
    return;
  }

  document.removeEventListener('selectionchange', onTextSelect, false);
  document.addEventListener('selectionchange', onTextSelect, false);

  if (selectionFixIntervalId) {
    clearInterval(selectionFixIntervalId);
  }

  // Resubscribe to selectionchange event because
  // the motherfucking iOS Safari is losing it.
  selectionFixIntervalId = setInterval(() => {
    document.removeEventListener('selectionchange', onTextSelect, false);
    document.addEventListener('selectionchange', onTextSelect, false);
  }, 1000);
};

const isInSelection = (element: HTMLElement, selection: Selection) => {
  if (!selection || selection.rangeCount === 0) {
    return false;
  }

  for (let i = 0; i < selection.rangeCount; i++) {
    const range = selection.getRangeAt(i);
    if (range.intersectsNode(element)) {
      return true;
    }
  }

  return false;
};

const isClickableElement = (element: HTMLElement): boolean => {
  if (
    ['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'VOCABLY-POPUP'].includes(
      element.tagName
    )
  ) {
    return true;
  }

  if (element.parentElement) {
    return isClickableElement(element.parentElement);
  }

  return false;
};

const doubleClick$ = new Subject<void>();

const onMouseUp = async (event: MouseEvent) => {
  const selection = getSelection();

  if (!selection) {
    return;
  }

  if (
    isClickableElement(event.target as HTMLElement) &&
    !isInSelection(event.target as HTMLElement, selection)
  ) {
    return;
  }

  try {
    await api.ping();
  } catch {
    return;
  }

  destroyButton();

  if (!isValidSelection(selection)) {
    return;
  }

  merge(doubleClick$.pipe(map(() => true)), timer(50).pipe(map(() => false)))
    .pipe(take(1))
    .subscribe(async (doubleClick) => {
      if (doubleClick) {
        return;
      }

      const settings = await api.getSettings();
      // This is the attempt to make the "Double click" functionality
      // work in Lemur browser on Android.
      // The mouse event is not trusted in Lemur on Android.
      if (
        event.isTrusted === false &&
        browser.getOS().name === 'Android' &&
        settings.showOnDoubleClick
      ) {
        destroyAllOverlays();
        await showOnDbClick({ isTouchscreen: true })();
      }

      if (!settings.hideSelectionButton) {
        await createButton(selection, event);
      }
    });
};

type AutoShowOptions = {
  isTouchscreen: boolean;
};

const showOnDbClick = (options: AutoShowOptions) => async () => {
  const settings = await api.getSettings();
  if (!settings.showOnDoubleClick) {
    return;
  }

  doubleClick$.next();

  await showPopup(options);
};

const showPopup = async (options: AutoShowOptions) => {
  const selection = getSelection();
  if (!isValidSelection(selection)) {
    return;
  }

  const text = getText(selection);

  if (popupAlreadyExists(text)) {
    return;
  }

  const detectedLanguage = await detectLanguage(selection);
  const context =
    detectedLanguage && contextLanguages.includes(detectedLanguage)
      ? getContext(selection)
      : undefined;

  await createPopup({
    detectedLanguage,
    text,
    context,
    globalRect: getGlobalRect(selection.getRangeAt(0).getBoundingClientRect()),
    isTouchscreen: options.isTouchscreen,
  });
};

const onMouseDown = async (event: MouseEvent) => {
  if (isClickableElement(event.target as HTMLElement)) {
    return;
  }

  try {
    await api.ping();
  } catch {
    return;
  }

  destroyButton();
};

let lastShiftPressed: number = 0;
const showOnHotKey = async (event: KeyboardEvent) => {
  if (event.key !== 'Shift') {
    return;
  }

  const settings = await api.getSettings();
  if (!settings.showOnHotKey) {
    return;
  }

  const now = new Date().getTime();
  if (now - lastShiftPressed <= 500) {
    await showPopup({
      isTouchscreen: false,
    });
    return;
  }

  lastShiftPressed = now;
};

export const registerContentScript = async (
  {
    api: apiOptions,
    youTube: youTubeOptions,
    contentScript,
  }: RegisterContentScriptOptions = {
    api: {},
    youTube: { ytHosts: ['www.youtube.com'] },
    contentScript: {
      askForRatingEnabled: false,
      displayMobileLookupButton: false,
      allowFirstTranslationCongratulation: false,
    },
  }
) => {
  configureApi(apiOptions);
  await defineCustomElements();
  initYoutube(youTubeOptions);
  configureContentScript(contentScript);
  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('mousedown', onMouseDown);
  document.addEventListener('keyup', showOnHotKey);

  document.addEventListener(
    'dblclick',
    showOnDbClick({ isTouchscreen: false })
  );

  browserEnv.runtime?.onMessage?.addListener((request) => {
    if (request && request.action === 'contextMenuTranslateClicked') {
      showPopup({ isTouchscreen: false });
    }
  });

  enableSelectionChangeDetection();
};
