import { defineCustomElements } from '@vocably/extension-content-ui/loader';
import { fixGrammar } from './grammar/fixGrammar';
import {
  FixGrammarPayload,
  isFixGrammarPayload,
  isGoogleLanguage,
} from '@vocably/model';
import { track } from './analytics';

document.body.classList.add('vocably-extension-disabled');
defineCustomElements();

const grammarFixer = document.createElement(
  'vocably-grammar-fixer'
) as HTMLVocablyGrammarFixerElement;

const getInitialValues = (): FixGrammarPayload => {
  const params = new URLSearchParams(window.location.search);
  const grammarFixerStorageValues = JSON.parse(
    localStorage.getItem('grammarFixerValues') ?? '{}'
  ) as Partial<FixGrammarPayload>;

  const language = params.get('language') ?? grammarFixerStorageValues.language;
  const explanationsLanguage =
    params.get('explanationLanguage') ??
    grammarFixerStorageValues.explanationLanguage;

  return {
    text: params.get('text') || '',
    language: isGoogleLanguage(language) ? language : 'en',
    context: params.get('context') || '',
    explanationLanguage: isGoogleLanguage(explanationsLanguage)
      ? explanationsLanguage
      : 'en',
  };
};

const updateQueryParameters = (values: FixGrammarPayload) => {
  const params = new URLSearchParams(window.location.search);
  params.set('text', values.text);
  params.set('language', values.language);
  params.set('context', values.context);
  params.set('explanationLanguage', values.explanationLanguage ?? '');
  window.history.replaceState(
    {},
    '',
    `${window.location.pathname}?${params.toString()}`
  );
};

const loadValues = async (values: FixGrammarPayload) => {
  track('Fix grammar', values);
  grammarFixer.isLoading = true;
  const result = await fixGrammar(values);
  grammarFixer.isLoading = false;
  grammarFixer.result = result;
};

grammarFixer.addEventListener(
  'formSubmit',
  async (e: CustomEvent<FixGrammarPayload>) => {
    if (isFixGrammarPayload(e.detail)) {
      updateQueryParameters(e.detail);
    }

    await loadValues(e.detail);
  }
);

const applyValuesToDom = (values: FixGrammarPayload) => {
  grammarFixer.values = values;

  document
    .querySelectorAll('.social-share-btn')
    .forEach((el: HTMLLinkElement) => {
      el.href = el.href.replace(
        /grammar.html.*/,
        encodeURIComponent(
          `grammar.html?language=${values.language}&explanationLanguage=${values.explanationLanguage}`
        )
      );
    });
};

grammarFixer.addEventListener(
  'valuesChange',
  async (e: CustomEvent<FixGrammarPayload>) => {
    if (!isFixGrammarPayload(e.detail)) {
      return;
    }
    updateQueryParameters(e.detail);
    applyValuesToDom(e.detail);
    localStorage.setItem('grammarFixerValues', JSON.stringify(e.detail));
  }
);

applyValuesToDom(getInitialValues());

if (grammarFixer.values.text.trim().length) {
  loadValues(grammarFixer.values).then();
}

document.getElementById('grammar-checker').appendChild(grammarFixer);
