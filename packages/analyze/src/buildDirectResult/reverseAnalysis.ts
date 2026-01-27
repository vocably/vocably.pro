import { ReverseAnalyzePayload } from '@vocably/model';
import { buildReverseResultYes } from '../buildReverseResult';
import { InputAnalysis } from '../detectInputTypeAi';
import { fetchPossibleTranslations } from '../fetchPossibleTranslations';

type Payload = {
  payload: ReverseAnalyzePayload;
  inputAnalysis: InputAnalysis;
};
export const reverseAnalysis = async ({ payload, inputAnalysis }: Payload) => {
  const reverseTranslateResult = await fetchPossibleTranslations({
    source: payload.target,
    sourceLanguage: payload.targetLanguage,
    targetLanguage: payload.sourceLanguage,
    inputType: inputAnalysis.type,
  });

  if (!reverseTranslateResult.success) {
    return reverseTranslateResult;
  }

  return buildReverseResultYes(
    payload,
    inputAnalysis,
    reverseTranslateResult.value
  );
};
