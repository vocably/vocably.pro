import { initializePaddle } from '@paddle/paddle-js';
import '@sneas/telephone/iphone-16-max';
import '@sneas/telephone/pixel-9-pro';
import { FilterSelectGroup } from '@vocably/extension-content-ui/src/components/filter-select/types';
import { languageAliases } from '@vocably/extension-content-ui/src/components/filter-select/language-aliases';
import { isGoogleLanguage, languageList } from '@vocably/model';
import * as Bowser from 'bowser';
import { track } from './analytics';
import './bootstrap.scss';
import './styles.scss';
import { searchConfig } from './constants';
import { getPreferredTargetLanguage } from './preferredLanguages';
import { words } from './search/words';
import { isLoggedIn, onSignedIn } from './user';

const browser = Bowser.getParser(window.navigator.userAgent);
const isAndroid = browser.is('android');
const isIos = browser.is('ios');
const isChrome = browser.is('chrome') && !isAndroid && !isIos;
const isSafari = browser.is('safari') && !isAndroid && !isIos;
const isEdge = browser.is('microsoft edge') && !isAndroid && !isIos;

const applyCssVariables = async ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  if (isLoggedIn) {
    document.documentElement.style.setProperty('--anonymous-display', 'block');
    document.documentElement.style.setProperty('--user-display', 'none');
  } else {
    document.documentElement.style.setProperty('--anonymous-display', 'none');
    document.documentElement.style.setProperty('--user-display', 'block');
  }
};

isLoggedIn().then((r) =>
  applyCssVariables({ isLoggedIn: r.success && r.value })
);

onSignedIn(() => applyCssVariables({ isLoggedIn: true }));

//@ts-ignore
window.trackEvent = track;

document.querySelectorAll('.show-other').forEach((el) => {
  if (isChrome || isEdge || isSafari || isAndroid || isIos) {
    el.remove();
  } else {
    el.classList.remove('show-other');
  }
});

document.querySelectorAll('.show-any').forEach((el) => {
  if (!(isChrome || isEdge || isSafari || isAndroid || isIos)) {
    el.remove();
  } else {
    el.classList.remove('show-any');
  }
});

document.querySelectorAll('.show-chrome').forEach((el) => {
  if (!isChrome) {
    el.remove();
  } else {
    el.classList.remove('show-chrome');
  }
});

document.querySelectorAll('.show-safari').forEach((el) => {
  if (!isSafari) {
    el.remove();
  } else {
    el.classList.remove('show-safari');
  }
});

document.querySelectorAll('.show-edge').forEach((el) => {
  if (!isEdge) {
    el.remove();
  } else {
    el.classList.remove('show-edge');
  }
});

document.querySelectorAll('.hide-edge').forEach((el) => {
  if (isEdge) {
    el.remove();
  } else {
    el.classList.remove('hide-edge');
  }
});

document.querySelectorAll('.hide-chrome').forEach((el) => {
  if (isChrome) {
    el.remove();
  } else {
    el.classList.remove('hide-chrome');
  }
});

document.querySelectorAll('.hide-safari').forEach((el) => {
  if (isSafari) {
    el.remove();
  } else {
    el.classList.remove('hide-safari');
  }
});

document.querySelectorAll('.hide-ios').forEach((el) => {
  if (isIos) {
    el.remove();
  } else {
    el.classList.remove('hide-ios');
  }
});

document.querySelectorAll('.show-ios').forEach((el) => {
  if (!isIos) {
    el.remove();
  } else {
    el.classList.remove('show-ios');
  }
});

document.querySelectorAll('.hide-android').forEach((el) => {
  if (isAndroid) {
    el.remove();
  } else {
    el.classList.remove('hide-android');
  }
});

document.querySelectorAll('.hide-other').forEach((el) => {
  if (!(isChrome || isEdge || isSafari || isAndroid || isIos)) {
    el.remove();
  } else {
    el.classList.remove('hide-other');
  }
});

document.querySelectorAll('.show-android').forEach((el) => {
  if (!isAndroid) {
    el.remove();
  } else {
    el.classList.remove('show-android');
  }
});

const downloadMobileApp = document.getElementById(
  'automatically-download-mobile-app'
);

if (downloadMobileApp) {
  const progress = document.getElementById('mobile-app-progress');
  const links = document.getElementById('mobile-app-links');

  if (isAndroid) {
    document.getElementById('mobile-app-ios-link').classList.add('d-none');
  } else if (isIos) {
    if (downloadMobileApp.dataset.redirect !== undefined) {
      window.location.href =
        'https://apps.apple.com/app/vocably-pro-language-cards/id1641258757';
    }
    document.getElementById('mobile-app-android-link').classList.add('d-none');
  }

  progress.classList.add('d-none');
  links.classList.remove('d-none');
}

if (
  browser.satisfies({ desktop: { chrome: '>90', edge: '>90', firefox: '>0' } })
) {
  document.querySelectorAll('.chrome-cta').forEach((el) => {
    el.classList.remove('d-none');
  });
} else if (browser.satisfies({ desktop: { safari: '>14' } })) {
  document.querySelectorAll('.safari-cta').forEach((el) => {
    el.classList.remove('d-none');
  });
} else {
  document.querySelectorAll('.cta-else').forEach((el) => {
    el.classList.remove('d-none');
  });
}

var tooltipTriggerList = [].slice.call(
  document.querySelectorAll('[data-bs-toggle="tooltip"]')
);

tooltipTriggerList.map(function (tooltipTriggerEl) {
  // @ts-ignore
  return new bootstrap.Tooltip(tooltipTriggerEl);
});

// Search form

const getSourceLanguage = () => {
  if (isGoogleLanguage(window['searchFormSourceLanguage'])) {
    return window['searchFormSourceLanguage'];
  }

  const params = new URLSearchParams(window.location.search);
  if (params.has('l') && isGoogleLanguage(params.get('l') ?? '')) {
    return params.get('l');
  }
  return (
    localStorage.getItem(searchConfig.sourceLanguageLocalStorageKey) ?? 'en'
  );
};

type LanguageSelect = HTMLElement & {
  value: string;
  optionGroups: FilterSelectGroup[];
};

const languageGroups: FilterSelectGroup[] = [
  {
    label: '',
    options: Object.entries(languageList)
      .map(([code, label]) => ({
        value: code,
        label,
        aliases: languageAliases(code),
      }))
      .sort((a, b) => a.label.localeCompare(b.label)),
  },
];

const searchForms = document.querySelectorAll<HTMLFormElement>('#searchForm');

if (searchForms.length > 0) {
  import('@vocably/extension-content-ui/loader').then(
    ({ defineCustomElements }) => defineCustomElements()
  );
}

searchForms.forEach((searchForm: HTMLFormElement) => {
  // The hidden inputs carry the values when the form is submitted.
  const sourceLanguageInput = searchForm.querySelector(
    'input[name=sourceLanguage]'
  ) as HTMLInputElement;
  const targetLanguageInput = searchForm.querySelector(
    'input[name=targetLanguage]'
  ) as HTMLInputElement;
  const textInput = searchForm.querySelector('[name=text]') as HTMLInputElement;

  const updatePlaceholder = () => {
    if (window.innerWidth < 600) {
      textInput.placeholder = 'Search...';
      return;
    }

    if (sourceLanguageInput.value === targetLanguageInput.value) {
      textInput.placeholder = 'Search for any word...';
      return;
    }

    textInput.placeholder = 'Search for any word or phrase...';
  };

  const languageChangeListeners: Array<() => void> = [];

  const setUpLanguageSelect = (
    wrapper: HTMLElement,
    input: HTMLInputElement,
    initialValue: string,
    localStorageKey: string
  ) => {
    const select = wrapper.querySelector(
      'vocably-filter-select'
    ) as LanguageSelect;
    const label = wrapper.querySelector('.label-text') as HTMLElement;

    const setValue = (value: string) => {
      input.value = value;
      select.value = value;
      label.textContent = languageList[value] ?? value;
    };

    select.optionGroups = languageGroups;
    setValue(initialValue);

    select.addEventListener('choose', (event: CustomEvent<string>) => {
      setValue(event.detail);
      try {
        localStorage.setItem(localStorageKey, event.detail);
      } catch {
        // Private windows and blocked site data: the choice lasts for this page.
      }
      updatePlaceholder();
      languageChangeListeners.forEach((listener) => listener());
    });
  };

  const sourceLanguage = getSourceLanguage();
  let targetLanguage: string = getPreferredTargetLanguage();
  if (targetLanguage === 'en-GB' && sourceLanguage === 'en') {
    targetLanguage = 'en';
  }

  setUpLanguageSelect(
    sourceLanguageInput.closest('.language-selector'),
    sourceLanguageInput,
    sourceLanguage,
    searchConfig.sourceLanguageLocalStorageKey
  );
  setUpLanguageSelect(
    targetLanguageInput.closest('.language-selector'),
    targetLanguageInput,
    targetLanguage,
    searchConfig.targetLanguageLocalStorageKey
  );

  updatePlaceholder();

  // "…, and I speak English too." when both languages are the same.
  const tooText = searchForm.querySelector<HTMLElement>(
    '.search-form-languages .too'
  );
  const updateToo = () => {
    if (tooText) {
      tooText.hidden = sourceLanguageInput.value !== targetLanguageInput.value;
    }
  };
  updateToo();
  languageChangeListeners.push(updateToo);

  // Reveal the language sentence once both selects have rendered, so the
  // unstyled pre-upgrade markup never shows up and shifts the layout.
  const languagesContainer = searchForm.querySelector('.search-form-languages');
  customElements.whenDefined('vocably-filter-select').then(() =>
    Promise.all(
      Array.from(
        searchForm.querySelectorAll('vocably-filter-select'),
        (select) =>
          (
            select as HTMLElement & {
              componentOnReady: () => Promise<unknown>;
            }
          ).componentOnReady()
      )
    ).then(() => languagesContainer?.classList.add('ready'))
  );

  const setUpExample = () => {
    const exampleContainer = searchForm.querySelector('.search-form-hint');

    if (!exampleContainer) {
      return;
    }

    const sourceExampleButton = searchForm.querySelector(
      '[data-search-source-example]'
    ) as HTMLButtonElement;
    const translationExampleContainer = searchForm.querySelector(
      `[data-search-relevant-target]`
    );
    const targetExampleButton = searchForm.querySelector(
      '[data-search-target-example]'
    ) as HTMLButtonElement;

    const onLanguageChange = () => {
      if (
        !isGoogleLanguage(sourceLanguageInput.value) ||
        !isGoogleLanguage(targetLanguageInput.value)
      ) {
        return;
      }
      const isRelevantTranslationLanguage =
        sourceLanguageInput.value !== targetLanguageInput.value;
      sourceExampleButton.innerHTML = words[sourceLanguageInput.value];
      targetExampleButton.innerHTML = words[targetLanguageInput.value];
      if (!isRelevantTranslationLanguage) {
        translationExampleContainer.classList.add('d-none');
        targetExampleButton.disabled = true;
      } else {
        translationExampleContainer.classList.remove('d-none');
        targetExampleButton.disabled = false;
      }
      exampleContainer.classList.remove('invisible');
    };

    onLanguageChange();
    languageChangeListeners.push(onLanguageChange);

    const onExampleClick = (e: Event) => {
      const word = e.target['innerHTML'];
      if (!word) {
        return;
      }

      textInput.value = word;
      searchForm.submit();
    };

    sourceExampleButton.addEventListener('click', onExampleClick);
    targetExampleButton.addEventListener('click', onExampleClick);
  };

  setUpExample();
});

initializePaddle({
  token: window['paddleClientSideToken'],
  environment: window['paddleClientSideToken'].startsWith('test')
    ? 'sandbox'
    : 'production',
  debug: window['paddleClientSideToken'].startsWith('test'),
}).then(async (Paddle) => {
  const { data } = await Paddle.PricePreview({
    items: [
      {
        priceId: window['paddleMonthlyPriceId'],
        quantity: 1,
      },
      {
        priceId: window['paddleYearlyPriceId'],
        quantity: 1,
      },
    ],
  });

  const {
    details: {
      lineItems: [monthlyItem, yearlyItem],
    },
  } = data;

  document
    .querySelectorAll('[data-monthly-price]')
    .forEach(
      (element) => (element.innerHTML = monthlyItem.formattedTotals.total)
    );

  document
    .querySelectorAll('[data-yearly-price]')
    .forEach(
      (element) => (element.innerHTML = yearlyItem.formattedTotals.total)
    );

  const monthlyTotal = Number(monthlyItem.totals.total);
  const yearlyTotal = Number(yearlyItem.totals.total);
  const savings = Math.floor((1 - yearlyTotal / (monthlyTotal * 12)) * 100);

  if (savings > 0) {
    document
      .querySelectorAll<HTMLElement>('[data-yearly-savings]')
      .forEach((element) => {
        element.textContent = `Save ${savings}%`;
        element.hidden = false;
      });
  }
});

// Selecting any word on the website opens the extension's popup. Its code is
// only fetched once the page has settled, as a chunk of its own.
const loadContentScript = () =>
  import('./contentScript')
    .then(({ registerWebsiteContentScript }) => registerWebsiteContentScript())
    .catch((e) => console.error('Unable to load the content script', e));

if ('requestIdleCallback' in window) {
  requestIdleCallback(loadContentScript);
} else {
  setTimeout(loadContentScript, 1000);
}
