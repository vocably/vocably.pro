import { defineCustomElements } from '@vocably/extension-content-ui/loader';
import { fixGrammar } from './grammar/fixGrammar';

document.body.classList.add('vocably-extension-disabled');
defineCustomElements();

const grammarChecker = document.createElement(
  'vocably-fix-grammar'
) as HTMLVocablyFixGrammarElement;

grammarChecker.fixGrammar = fixGrammar;

document.getElementById('grammar-checker').appendChild(grammarChecker);
