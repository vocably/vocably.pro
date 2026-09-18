import { browser } from '@vocably/browser';
import { detectLocale } from '@vocably/browser-i18n';
import { setLocale, t } from '@vocably/extension-content-ui/src/i18n';
import { api } from './api';
import { contextLanguages } from './contextLanguages';
import { detectLanguage } from './detectLanguage';
import { getContext } from './getContext';
import { isHtmlElement } from './isHtmlElement';
import { createPopup, destroyAllOverlays } from './popup';
import { getGlobalRect } from './position';
import { setYouTubeStyles, youtubeHighlightDuration } from './styles';
import { extractTokens } from './tokenizer/extractTokens';
import { destroyButton } from './button';
import { showSnackbar } from './snackbar';

const ytPlayerTagName = 'ytd-player';

// The distance the cursor has to travel with the button pressed
// for the movement to be considered a drag attempt.
const dragThreshold = 5;

const selectableCaptionsClassName = 'vocably-selectable-captions';
const highlightedCaptionsClassName = 'vocably-selectable-captions-highlighted';

export const getPlayerElements = (): HTMLElement[] => {
  const players = document.querySelectorAll(ytPlayerTagName);
  return Array.from(players) as HTMLElement[];
};

export type InitYouTubeOptions = {
  ytHosts: string[];
};

let textHintShowed = false;

const showSelectTextHint = async () => {
  const { locale } = await api.getSettings();
  setLocale(locale ?? detectLocale());

  showSnackbar(
    browser.getOS().name === 'macOS'
      ? t('youtube.press_option_to_select')
      : t('youtube.press_alt_to_select')
  );

  textHintShowed = true;
  setTimeout(() => {
    textHintShowed = false;
  }, 1000);
};

// The captions are not selectable unless Alt (Option) is pressed,
// so a drag attempt is a good moment to explain how to select them.
const watchDragAttempt = (event: MouseEvent) => {
  if (event.altKey) {
    return;
  }

  const { clientX: startX, clientY: startY } = event;

  const stopWatching = () => {
    document.removeEventListener('mousemove', onMouseMove, true);
    document.removeEventListener('mouseup', stopWatching, true);
  };

  const onMouseMove = (moveEvent: MouseEvent) => {
    if (moveEvent.altKey) {
      stopWatching();
      return;
    }

    if (
      Math.abs(moveEvent.clientX - startX) < dragThreshold &&
      Math.abs(moveEvent.clientY - startY) < dragThreshold
    ) {
      return;
    }

    stopWatching();
    showSelectTextHint();
  };

  // The captions handle mouseup themselves and stop its propagation,
  // so the listeners have to be attached on the capture phase.
  document.addEventListener('mouseup', stopWatching, true);
  document.addEventListener('mousemove', onMouseMove, true);
};

const handlePlayerElement = (player: HTMLElement): (() => void) => {
  let videoElement: HTMLVideoElement | null = null;

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type !== 'childList') return;
      if (!mutation.target) return;
      if (!isHtmlElement(mutation.target)) return;
      if (!mutation.target.classList) return;
      if (!mutation.target.classList.contains('ytp-caption-segment')) return;

      if (!videoElement) {
        videoElement = player.querySelector('video');
        videoElement?.addEventListener('play', () => {
          window.getSelection()?.removeAllRanges();
          destroyAllOverlays();
          destroyButton();
        });
      }

      mutation.addedNodes.forEach((node) => {
        if (isHtmlElement(node) && node.classList.contains('replaced')) return;

        const tokens = extractTokens(node.textContent ?? '');

        if (tokens === false) {
          return;
        }

        const span = document.createElement('span');
        span.classList.add('replaced');

        tokens.forEach((token, index) => {
          if (token.type !== 'word') {
            span.append(document.createTextNode(token.text));
            return;
          }

          const anchor = document.createElement('span');
          anchor.classList.add('vocably-word');
          anchor.innerText = token.text;

          anchor.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            watchDragAttempt(e);
          });

          anchor.addEventListener('mouseup', (e) => {
            e.preventDefault();
            e.stopPropagation();
          });

          anchor.addEventListener('click', async () => {
            if (textHintShowed) {
              return;
            }

            videoElement?.pause();
            const detectedLanguage = await detectLanguage(anchor);
            await createPopup({
              detectedLanguage,
              text: anchor.textContent ?? '',
              globalRect: getGlobalRect(anchor.getBoundingClientRect()),
              isTouchscreen: false,
              initiator: 'youtube',
              context:
                detectedLanguage && contextLanguages.includes(detectedLanguage)
                  ? getContext(anchor)
                  : undefined,
            });
          });

          span.append(anchor);
        });

        if ((node as any).parentNode) {
          const captionWindow = (node as any).parentNode.closest(
            '.caption-window'
          );
          captionWindow.removeAttribute('tabindex');
        }

        if ((node as any).replaceWith) {
          (node as any).replaceWith(span);
        }
      });
    });
  });

  observer.observe(player, {
    attributes: false,
    childList: true,
    subtree: true,
  });

  return () => {
    observer.disconnect();
  };
};

type SelectableCaptions = {
  captionContainerList: HTMLElement[];
  captionContainersCloneList: HTMLElement[];
};

const makeCaptionsSelectable = (): SelectableCaptions => {
  const captionContainerList: HTMLElement[] = [];
  const captionContainersCloneList: HTMLElement[] = [];

  getPlayerElements().forEach((player) => {
    player.style.userSelect = 'auto';
    player.style.webkitUserSelect = 'auto';

    const container = player.querySelector('.ytd-player');
    if (isHtmlElement(container)) {
      container.style.userSelect = 'auto';
      container.style.webkitUserSelect = 'auto';
    }

    const captionContainer = player.querySelector(
      '#ytp-caption-window-container'
    );
    if (!isHtmlElement(captionContainer)) {
      return;
    }

    captionContainer.style.userSelect = 'auto';
    captionContainer.style.webkitUserSelect = 'auto';

    const captionContainerClone = captionContainer.cloneNode(
      true
    ) as HTMLElement;
    captionContainerClone.classList.add(selectableCaptionsClassName);
    captionContainerList.push(captionContainer);
    captionContainersCloneList.push(captionContainerClone);
    captionContainer.hidden = true;
    captionContainer.before(captionContainerClone);
    captionContainerClone
      .querySelectorAll('.caption-window')
      .forEach((captionWindow) => {
        if (!isHtmlElement(captionWindow)) {
          return;
        }

        captionWindow.draggable = false;
        captionWindow.style.userSelect = 'auto';
        captionWindow.style.webkitUserSelect = 'auto';

        captionWindow.querySelectorAll('.captions-text').forEach((element) => {
          if (!isHtmlElement(element)) {
            return;
          }

          element.style.userSelect = 'auto';
          element.style.webkitUserSelect = 'auto';
        });

        captionWindow
          .querySelectorAll('.ytp-caption-segment')
          .forEach((segment) => {
            if (!isHtmlElement(segment)) {
              return;
            }

            segment.style.cursor = 'text';
          });

        captionWindow
          .querySelectorAll('.vocably-word')
          .forEach((word) => word.classList.add('vocably-word-disabled'));
      });
  });

  return { captionContainerList, captionContainersCloneList };
};

const hasTextSelection = (): boolean => {
  const selection = window.getSelection();

  if (!selection || selection.isCollapsed) {
    return false;
  }

  return selection.toString().trim() !== '';
};

export const initYoutube = async (options: InitYouTubeOptions) => {
  if (!options.ytHosts.includes(window.location.host)) {
    return;
  }

  setYouTubeStyles();

  getPlayerElements().forEach((player) => {
    handlePlayerElement(player);
  });

  const playerObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (!isHtmlElement(node)) {
          return;
        }

        if (node.tagName === ytPlayerTagName) {
          handlePlayerElement(node);
          return;
        }

        const players = node.getElementsByTagName(ytPlayerTagName);
        for (const player of players) {
          if (!isHtmlElement(player)) {
            continue;
          }
          handlePlayerElement(player);
        }
      });
    });
  });

  playerObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  let isAltDown = false;
  let isMouseDown = false;
  let selectableCaptions: SelectableCaptions | null = null;
  let fadingOutCaptions: SelectableCaptions | null = null;
  let tearDownTimeout: ReturnType<typeof setTimeout> | null = null;
  let removeCaptionsTimeout: ReturnType<typeof setTimeout> | null = null;

  const cancelScheduledTearDown = () => {
    if (tearDownTimeout === null) {
      return;
    }

    clearTimeout(tearDownTimeout);
    tearDownTimeout = null;
  };

  const cancelScheduledRemoval = (): SelectableCaptions | null => {
    if (removeCaptionsTimeout !== null) {
      clearTimeout(removeCaptionsTimeout);
      removeCaptionsTimeout = null;
    }

    const captions = fadingOutCaptions;
    fadingOutCaptions = null;

    return captions;
  };

  const removeCaptions = (captions: SelectableCaptions) => {
    captions.captionContainersCloneList.forEach((element) => element.remove());
    captions.captionContainerList.forEach(
      (element) => (element.hidden = false)
    );
  };

  const setUp = () => {
    cancelScheduledTearDown();

    if (selectableCaptions === null) {
      selectableCaptions = cancelScheduledRemoval() ?? makeCaptionsSelectable();
    }

    selectableCaptions.captionContainersCloneList.forEach((element) => {
      // Forces a reflow, so the highlight is transitioned in
      // instead of being applied right away.
      void element.offsetHeight;
      element.classList.add(highlightedCaptionsClassName);
    });
  };

  const tearDown = () => {
    cancelScheduledTearDown();

    isAltDown = false;
    isMouseDown = false;

    if (selectableCaptions === null) {
      return;
    }

    const captions = selectableCaptions;
    selectableCaptions = null;
    fadingOutCaptions = captions;

    captions.captionContainersCloneList.forEach((element) =>
      element.classList.remove(highlightedCaptionsClassName)
    );

    removeCaptionsTimeout = setTimeout(() => {
      removeCaptionsTimeout = null;
      fadingOutCaptions = null;
      removeCaptions(captions);
    }, youtubeHighlightDuration);
  };

  const isInUse = (): boolean => isAltDown || isMouseDown || hasTextSelection();

  const scheduleTearDown = () => {
    cancelScheduledTearDown();

    if (selectableCaptions === null || isInUse()) {
      return;
    }

    tearDownTimeout = setTimeout(() => {
      tearDownTimeout = null;

      if (isInUse()) {
        return;
      }

      tearDown();
    }, 100);
  };

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Alt' || isAltDown) {
      return;
    }

    isAltDown = true;
    setUp();
  });

  document.addEventListener('keyup', (e) => {
    if (e.key !== 'Alt' || !isAltDown) {
      return;
    }

    isAltDown = false;
    scheduleTearDown();
  });

  document.addEventListener('mousedown', (e) => {
    if (e.button !== 0) {
      return;
    }

    isMouseDown = true;
  });

  document.addEventListener('mouseup', (e) => {
    if (e.button !== 0) {
      return;
    }

    isMouseDown = false;
    scheduleTearDown();
  });

  document.addEventListener('selectionchange', () => {
    scheduleTearDown();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      tearDown();
    }
  });

  window.addEventListener('blur', () => {
    tearDown();
  });
};
