import { GoogleLanguage } from './language';

export type Translation = {
  source: string;
  sourceLanguage: GoogleLanguage;
  target: string;
  targetLanguage: GoogleLanguage;
  partOfSpeech?: string;
  transcript?: string;
  lemma?: string;
  lemmaPos?: string;
  isDirect?: boolean;
};

export type AiTranslation = Translation &
  Required<
    Pick<Translation, 'partOfSpeech' | 'lemma' | 'lemmaPos' | 'transcript'>
  >;

export type DirectAnalyzePayload = {
  source: string;
  sourceLanguage: GoogleLanguage;
  targetLanguage: GoogleLanguage;
  context?: string;
};

export type ReverseAnalyzePayload = {
  target: string;
  sourceLanguage: GoogleLanguage;
  targetLanguage: GoogleLanguage;
};

export type AnalyzePayload = DirectAnalyzePayload | ReverseAnalyzePayload;

export const isDirectAnalyzePayload = (o: any): o is DirectAnalyzePayload => {
  return !(!o || !o.source || !o.targetLanguage);
};

export const isReverseAnalyzePayload = (o: any): o is ReverseAnalyzePayload => {
  return !(!o || !o.target || !o.sourceLanguage || !o.targetLanguage);
};

export type AnalysisNumber = 'plural' | 'singular';

export type Tense = 'present' | 'past' | 'future';

export const isAnalysisNumber = (o: any): o is AnalysisNumber => {
  return ['plural', 'singular'].includes(o);
};

export const isTense = (o: any): o is Tense => {
  return ['present', 'past', 'future'].includes(o);
};

export type AnalysisItem = {
  source: string;
  ipa?: string;
  definitions: string[];
  examples?: string[];
  translation: string;
  partOfSpeech?: string;
  g?: string; // gender
  number?: AnalysisNumber;
  tense?: Tense;
  pastTenses?: string;
  pluralForm?: string;
};

export type ValidAnalysisItems = [AnalysisItem, ...AnalysisItem[]];

export const inputTypes = [
  'word',
  'compound word',
  'phrasal verb',
  'phrase',
  'sentence',
  'idiom',
] as const;

export type DetectedInputType = (typeof inputTypes)[number];

export const unitOfSpeechTypes: DetectedInputType[] = [
  'word',
  'compound word',
  'phrasal verb',
  'idiom',
];

export type DirectAnalysis = {
  source: string;
  sourceLanguage: GoogleLanguage;
  targetLanguage: GoogleLanguage;
  // ToDo: Remove
  explanation?: string;
  // ToDo: Remove
  translation: Translation;
  items: ValidAnalysisItems;
  isDirect: boolean;
  detectedInputType: DetectedInputType;
  aiThinksItIs?: string;
};

export type ReverseAnalysis = DirectAnalysis & {
  target: string;
};

export type Analysis = DirectAnalysis | ReverseAnalysis;

export const isReverseAnalysis = (o: any): o is ReverseAnalysis => {
  return !(!o || !o.target);
};
