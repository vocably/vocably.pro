import { Result } from '@vocably/model';

import { get } from 'lodash-es';
import { send } from './brevo';

const templates = {
  es: 18,
  pt: 36,
  ru: 7,
  tr: 35,
  uk: 9,
  vi: 34,
  zh: 39,
  'zh-TW': 37,
};

const defaultTemplate = 3;

export const welcomeMobileApp = async (
  email: string,
  language: string
): Promise<Result<any>> => {
  return send({
    email,
    templateId: get(templates, language, defaultTemplate),
  });
};
