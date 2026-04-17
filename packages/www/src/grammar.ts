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
import { analyze } from './search/analyze';
import { playAudioPronunciation } from './search/playAudioPronunciation';

document.body.classList.add('vocably-extension-disabled');
defineCustomElements();

alert('Piu');
