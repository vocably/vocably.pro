import { GoogleLanguage } from './language';

export type FixGrammarPayload = {
  text: string;
  language: GoogleLanguage;
  context?: string;
  explanationLanguage?: GoogleLanguage;
};

export type FixGrammarResponse = {
  text: string;
  explanation: string;
  isCorrect: boolean;
};

export const isFixGrammarResponse = (data: any): data is FixGrammarResponse => {
  return (
    typeof data['text'] === 'string' &&
    typeof data['explanation'] === 'string' &&
    typeof data['isCorrect'] === 'boolean'
  );
};
