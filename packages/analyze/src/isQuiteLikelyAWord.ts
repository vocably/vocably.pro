import { DetectInputTypeAiPayload } from './detectInputTypeAi';
import { GoogleLanguage } from '@vocably/model';

const languagesThatDontUseSpaces: GoogleLanguage[] = [
  'zh',
  'zh-TW',
  'ja',
  'th',
  'lo',
  'km',
  'my',
  'am',
];

export const isQuiteLikelyAWord = ({
  source,
  language,
}: DetectInputTypeAiPayload): boolean => {
  if (languagesThatDontUseSpaces.includes(language)) {
    return false;
  }

  return !/\s/.test(source.trim());
};
