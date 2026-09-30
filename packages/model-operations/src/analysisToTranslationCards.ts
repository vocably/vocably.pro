import { Analysis, LanguageDeck, TranslationCards } from '@vocably/model';

/**
 * Combines an analysis with the collection it has to be shown against.
 *
 * A signed out user has no collection, so `deck` defaults to an empty one in
 * the analysis source language: every card comes out as addable.
 */
export const analysisToTranslationCards = (
  analysis: Analysis,
  deck: LanguageDeck = {
    language: analysis.sourceLanguage,
    cards: [],
    tags: [],
  }
): TranslationCards => ({
  deck,
  explanation: analysis.explanation ?? '',
  source: analysis.source,
  sourceLanguage: analysis.sourceLanguage,
  targetLanguage: analysis.targetLanguage,
  isDirect: analysis.isDirect,
  detectedInputType: analysis.detectedInputType,
  aiThinksItIs: analysis.aiThinksItIs,
  items: analysis.items,
});
