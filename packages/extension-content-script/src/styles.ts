export const youtubeHighlightDuration = 50;

const primary = `#0050ff`;
const darkPrimary = `#28a5ff`;

export const setYouTubeStyles = () => {
  const style = document.createElement('style');
  style.innerHTML = `
  .vocably-word {
    position: relative;
    z-index: 0;

    &:not(.vocably-word-disabled) {
      cursor: pointer;
    }

    &::before {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: ${primary};
      box-shadow: -2px 0 0 ${primary}, 2px 0 0 ${primary};
      content: '';
      border-radius: 8px;
      z-index: -1;
      opacity: 0;
      transform: scale(50%);
      transition: all 100ms ease-in-out;
    }

    &:not(.vocably-word-disabled):hover {
      color: white;

      &::before {
        opacity: 1;
        transform: scale(100%);
      }
    }
  }

  .vocably-selectable-captions .ytp-caption-segment {
    transition: text-shadow ${youtubeHighlightDuration}ms ease-in-out;
  }
  .vocably-selectable-captions-highlighted .ytp-caption-segment {
    text-shadow: 0 0 5px ${darkPrimary}, 0 0 10px ${darkPrimary}, 0 0 20px ${darkPrimary},
      0 0 40px ${darkPrimary} !important;
  }
`;
  document.head.appendChild(style);
};

export const snackbarTransitionDuration = 200;

const snackbarClassName = 'vocably-snackbar';

let snackbarStylesAreSet = false;

export const setSnackbarStyles = () => {
  if (snackbarStylesAreSet) {
    return;
  }

  snackbarStylesAreSet = true;

  const style = document.createElement('style');
  style.innerHTML = `
  .${snackbarClassName} {
    position: fixed;
    left: 50%;
    bottom: 24px;
    transform: translate(-50%, 8px);
    box-sizing: border-box;
    max-width: min(90vw, 400px);
    padding: 10px 16px;
    border-radius: 8px;
    background-color: rgba(32, 33, 36, 0.95);
    color: #ffffff;
    font-family: Roboto, Arial, Helvetica, sans-serif;
    font-size: 14px;
    font-weight: 400;
    line-height: 20px;
    text-align: center;
    pointer-events: none;
    opacity: 0;
    transition: opacity ${snackbarTransitionDuration}ms ease-in-out,
      transform ${snackbarTransitionDuration}ms ease-in-out;
  }

  .${snackbarClassName}.${snackbarClassName}-visible {
    opacity: 1;
    transform: translate(-50%, 0);
  }
`;
  document.head.appendChild(style);
};

export const snackbarClassNames = {
  snackbar: snackbarClassName,
  visible: `${snackbarClassName}-visible`,
};
