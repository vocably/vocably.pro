import { Result } from '@vocably/model';
import { get } from 'lodash-es';
import { send } from './brevo';

const templates = {
  es: 24,
  pt: 27,
  ru: 5,
  tr: 26,
  uk: 8,
  vi: 25,
  zh: 38,
  'zh-TW': 28,
};

const defaultTemplate = 2;

export const welcomeExtensionUser = async (
  email: string,
  language: string
): Promise<Result<any>> => {
  return send({
    email,
    templateId: get(templates, language, defaultTemplate),
  });
};
