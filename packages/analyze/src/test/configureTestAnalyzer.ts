import { configureAnalyzer } from '../config';

export const configureTestAnalyzer = () => {
  configureAnalyzer({
    googleProjectId: process.env.GOOGLE_PROJECT_ID ?? '',
    openaiApiKey: process.env.OPENAI_API_KEY ?? '',
    geminiApiKey: process.env.GEMINI_API_KEY ?? '',
    jevApiKey: process.env.JEV_API_KEY ?? '',
    awsRegion: process.env.AWS_REGION ?? '',
    unitsOfSpeechBucket: process.env.UNITS_OF_SPEECH_BUCKET ?? '',
  });
};
