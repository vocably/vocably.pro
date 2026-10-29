import { Result } from '@vocably/model';
import { get } from 'lodash-es';
import { send } from './brevo';

const templates = {
  es: 29,
  pt: 32,
  ru: 6,
  tr: 31,
  uk: 10,
  vi: 30,
  zh: 40,
};

const defaultTemplate = 4;

export const mobileAppInstalled = async (
  email: string,
  language: string
): Promise<Result<any>> => {
  return send({
    email,
    templateId: get(templates, language, defaultTemplate),
  });
};
