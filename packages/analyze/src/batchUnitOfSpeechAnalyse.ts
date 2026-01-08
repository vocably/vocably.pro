import {
  BatchUnitOfSpeechAnalysis,
  BatchUnitOfSpeechAnalyzePayload,
} from '@vocably/model';
import { analyseAndTranslate } from './analyseAndTranslate';

export const batchUnitOfSpeechAnalyse = async ({
  sourceLanguage,
  targetLanguage,
  unitsOfSpeech,
}: BatchUnitOfSpeechAnalyzePayload): Promise<BatchUnitOfSpeechAnalysis> => {
  const analysisResults = await Promise.all(
    unitsOfSpeech.map(async (unitOfSpeech) => {
      return {
        unitOfSpeech,
        analysisResult: await analyseAndTranslate({
          source: unitOfSpeech.headword,
          partOfSpeech: unitOfSpeech.partOfSpeech,
          sourceLanguage,
          targetLanguage,
        }),
      };
    })
  );

  let analysisItems: BatchUnitOfSpeechAnalysis['items'] = [];
  let failed: BatchUnitOfSpeechAnalysis['failed'] = [];

  analysisResults.forEach(({ unitOfSpeech, analysisResult }) => {
    if (analysisResult.success === false) {
      failed.push({
        unitOfSpeech,
        errorCode: analysisResult.errorCode ?? 'UNKNOWN',
      });
      return;
    }

    analysisItems.push(analysisResult.value);
  });

  return {
    items: analysisItems,
    failed,
  };
};
