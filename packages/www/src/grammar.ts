import { defineCustomElements } from '@vocably/extension-content-ui/loader';
import { fixGrammar } from './grammar/fixGrammar';

document.body.classList.add('vocably-extension-disabled');
defineCustomElements();

const grammarFixer = document.createElement(
  'vocably-grammar-fixer'
) as HTMLVocablyGrammarFixerElement;

grammarFixer.fixGrammar = fixGrammar;

document.getElementById('grammar-checker').appendChild(grammarFixer);
