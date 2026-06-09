import { defineCustomElements } from '@vocably/extension-content-ui/loader';
import { SearchValues } from '@vocably/extension-content-ui/src/components/search-form/types';
import {
  Analysis,
  AnalyzePayload,
  GoogleLanguage,
  isGoogleLanguage,
  Result,
  TranslationCards,
} from '@vocably/model';
import { isObject } from 'lodash-es';
import { track } from './analytics';
import { analyze as requestAnalyze } from './search/analyze';
import { playAudioPronunciation } from './search/playAudioPronunciation';
import { searchConfig } from './constants';

import posthog from 'posthog-js';

posthog.init('phc_zSkRhQ7tE4RDFRdxIVXzWwJ66ACL9QAHnyrRpRknyHj', {
  api_host: 'https://api-e.vocably.pro',
  person_profiles: 'identified_only',
  persistence: 'memory',
  disable_external_dependency_loading: true,
  capture_pageview: false,
  autocapture: false,
  disable_session_recording: true,
  disable_surveys: true,
  mask_personal_data_properties: true,
  before_send: (event) => {
    if (event && event.properties) {
      // 1. Remove standard device metadata properties that can aid fingerprinting
      delete event.properties['$device_id'];
      delete event.properties['$device_name'];
      delete event.properties['$device_model'];
      delete event.properties['$device_manufacturer'];
      delete event.properties['$os_version'];
      delete event.properties['$os_name'];

      // 2. Clear out explicit network or location keys to guarantee anonymity
      delete event.properties['$ip'];
      delete event.properties['$geoip_city_name'];
      delete event.properties['$geoip_country_code'];
      delete event.properties['$geoip_country_name'];
    }

    // Return the sanitized event back to the pipeline
    return event;
  },
});

posthog.identify();

document.body.classList.add('vocably-extension-disabled');
defineCustomElements();

// Force reload page on browser back
window.addEventListener('popstate', (event) => {
  window.location.reload();
});

const updateRepoUrls = (language: string) => {
  let repoUrl = `https://github.com/vocably`;
  if (isGoogleLanguage(language)) {
    repoUrl += `/${language}`;
  }

  document.querySelectorAll('.repo-link').forEach((link) => {
    link['href'] = repoUrl;
  });
};

const isSearchValues = (value: any): value is SearchValues => {
  return (
    isObject(value) &&
    'sourceLanguage' in value &&
    'targetLanguage' in value &&
    'text' in value &&
    'isReversed' in value
  );
};

const searchValuesToAnalyzePayload = (values: SearchValues): AnalyzePayload => {
  if (values.isReversed) {
    return {
      target: values.text,
      sourceLanguage: values.sourceLanguage as GoogleLanguage,
      targetLanguage: values.targetLanguage as GoogleLanguage,
    };
  } else {
    return {
      source: values.text,
      sourceLanguage: values.sourceLanguage as GoogleLanguage,
      targetLanguage: values.targetLanguage as GoogleLanguage,
    };
  }
};

const getInitialSearchValues = (): SearchValues => {
  const params = new URLSearchParams(window.location.search);
  return {
    sourceLanguage:
      params.get('sourceLanguage') ||
      localStorage.getItem(searchConfig.sourceLanguageLocalStorageKey) ||
      'de',
    targetLanguage:
      params.get('targetLanguage') ||
      localStorage.getItem(searchConfig.targetLanguageLocalStorageKey) ||
      'en',
    text: params.get('text') || '',
    isReversed: params.get('isReversed') === 'true',
  };
};

const saveSearchValues = (searchValues: SearchValues) => {
  const params = new URLSearchParams(window.location.search);
  params.set('sourceLanguage', searchValues.sourceLanguage);
  params.set('targetLanguage', searchValues.targetLanguage);
  params.set('text', searchValues.text);
  params.set('isReversed', searchValues.isReversed.toString());
  window.history.pushState({}, '', `search.html?${params.toString()}`);
  document.title = 'Vocably - Online Dictionary';
};

const searchContainer = document.getElementById('search');

const existingSearchForm = searchContainer.querySelector('vocably-search-form');

const searchForm =
  existingSearchForm ??
  (document.createElement(
    'vocably-search-form'
  ) as HTMLVocablySearchFormElement);

const applyValuesToDom = (values: SearchValues) => {
  searchForm.values = values;

  updateRepoUrls(values.sourceLanguage);

  document
    .querySelectorAll('.social-share-btn')
    .forEach((el: HTMLLinkElement) => {
      el.href = el.href.replace(
        /search.html.*/,
        encodeURIComponent(
          `search.html?sourceLanguage=${values.sourceLanguage}&targetLanguage=${values.targetLanguage}`
        )
      );
    });
};

if (!existingSearchForm) {
  const initialSearchValues = getInitialSearchValues();
  applyValuesToDom(initialSearchValues);
  searchContainer.appendChild(searchForm);
}

const existingResultsContainer =
  searchContainer.querySelector('.results-container');

const resultsContainer =
  existingResultsContainer ?? document.createElement('div');
if (!existingResultsContainer) {
  resultsContainer.classList.add('results-container');
  searchContainer.appendChild(resultsContainer);
}

const onLearn = (event) => {
  posthog.capture('search-learn-clicked', {
    ...event.detail.card.data,
  });
  // @ts-ignore
  new bootstrap.Modal(document.getElementById('myModal')).show();
};

const existingTranslation = searchContainer.querySelector(
  'vocably-translation'
);

if (existingTranslation) {
  posthog.capture('search-seo-page-opened');
  existingTranslation.playAudioPronunciation = playAudioPronunciation;
  existingTranslation.addEventListener('addCard', onLearn);
}

searchForm.addEventListener('valuesChange', (e: CustomEvent<SearchValues>) => {
  if (isSearchValues(e.detail)) {
    applyValuesToDom(e.detail);
  }
});

const createTranslationCards = (
  analyzeResult: Result<Analysis>
): Result<TranslationCards> => {
  if (analyzeResult.success === false) {
    return analyzeResult;
  }

  return {
    success: true,
    value: {
      source: analyzeResult.value.source,
      sourceLanguage: analyzeResult.value.sourceLanguage,
      targetLanguage: analyzeResult.value.targetLanguage,
      detectedInputType: analyzeResult.value.detectedInputType,
      aiThinksItIs: analyzeResult.value.aiThinksItIs,
      items: analyzeResult.value.items,
      deck: {
        language: analyzeResult.value.sourceLanguage,
        cards: [],
        tags: [],
      },
      explanation: '',
    },
  };
};

const analyze = async (searchValues: SearchValues) => {
  track('Search', searchValues);
  posthog.capture('search-analyze', {
    ...searchValues,
  });

  updateRepoUrls(searchValues.sourceLanguage);

  resultsContainer.innerHTML = `<vocably-skeleton-loader></vocably-skeleton-loader>`;

  localStorage.setItem(
    searchConfig.sourceLanguageLocalStorageKey,
    searchValues.sourceLanguage
  );
  localStorage.setItem(
    searchConfig.targetLanguageLocalStorageKey,
    searchValues.targetLanguage
  );

  const analyzeResult = await requestAnalyze({
    ...searchValuesToAnalyzePayload(searchValues),
  });

  const translation = document.createElement(
    'vocably-translation'
  ) as HTMLVocablyTranslationElement;
  translation.isLightweight = true;
  translation.showLanguages = false;
  translation.hideChatGpt = true;
  translation.result = createTranslationCards(analyzeResult);
  translation.loading = false;
  translation.playAudioPronunciation = playAudioPronunciation;
  translation.addEventListener('addCard', onLearn);

  resultsContainer.innerHTML = '';
  resultsContainer.appendChild(translation);

  translation.addEventListener('retry', () => {
    if (isSearchValues(searchForm.values)) {
      analyze(searchForm.values).then();
    }
  });
};

searchForm.addEventListener(
  'formSubmit',
  async (e: CustomEvent<SearchValues>) => {
    if (isSearchValues(e.detail)) {
      document.getElementById('explanation')?.remove();
      saveSearchValues(e.detail);
    }

    await analyze(e.detail);
  }
);

searchForm.addEventListener(
  'valuesChange',
  async (e: CustomEvent<SearchValues>) => {
    if (!isSearchValues(e.detail)) {
      return;
    }

    updateRepoUrls(e.detail.sourceLanguage);
  }
);

if (!existingSearchForm && searchForm.values && searchForm.values.text.length) {
  analyze(searchForm.values).then();
}
