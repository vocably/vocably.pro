import {
  setSnackbarStyles,
  snackbarClassNames,
  snackbarTransitionDuration,
} from './styles';
import { applyMaxZIndex } from './styling';

const defaultDuration = 4000;

let snackbar: HTMLElement | null = null;
let hideTimeout: ReturnType<typeof setTimeout> | null = null;
let removeTimeout: ReturnType<typeof setTimeout> | null = null;

const cancelScheduledHide = () => {
  if (hideTimeout === null) {
    return;
  }

  clearTimeout(hideTimeout);
  hideTimeout = null;
};

const cancelScheduledRemoval = () => {
  if (removeTimeout === null) {
    return;
  }

  clearTimeout(removeTimeout);
  removeTimeout = null;
};

export const hideSnackbar = () => {
  cancelScheduledHide();

  if (snackbar === null) {
    return;
  }

  const element = snackbar;
  element.classList.remove(snackbarClassNames.visible);

  cancelScheduledRemoval();
  removeTimeout = setTimeout(() => {
    removeTimeout = null;
    element.remove();
  }, snackbarTransitionDuration);
};

export const showSnackbar = (message: string, duration = defaultDuration) => {
  setSnackbarStyles();

  if (snackbar === null) {
    snackbar = document.createElement('div');
    snackbar.classList.add(snackbarClassNames.snackbar);
    applyMaxZIndex(snackbar);
  }

  snackbar.innerText = message;

  cancelScheduledHide();
  cancelScheduledRemoval();

  // The captions can be watched in the fullscreen mode,
  // where only the descendants of the fullscreen element are visible.
  const container = document.fullscreenElement ?? document.body;
  if (snackbar.parentNode !== container) {
    container.appendChild(snackbar);
  }

  // Forces a reflow, so the snackbar is transitioned in
  // instead of being displayed right away.
  void snackbar.offsetHeight;
  snackbar.classList.add(snackbarClassNames.visible);

  hideTimeout = setTimeout(() => {
    hideTimeout = null;
    hideSnackbar();
  }, duration);
};
