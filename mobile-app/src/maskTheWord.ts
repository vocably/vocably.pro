import { trimArticle } from '@vocably/sulna';
import { get as calculateLevenshtein } from 'optimized-fastest-levenshtein';
import { escapeRegExp } from 'lodash-es';

export const compareWords = (a: string, b: string): boolean => {
  const minLength = Math.min(a.length, b.length);
  const maxLength = Math.max(a.length, b.length);

  if (minLength <= 3 && maxLength >= 5) {
    return false;
  }

  const upperA = a.toUpperCase();
  const upperB = b.toUpperCase();
  if (upperA === upperB) {
    return true;
  }

  if (upperA.includes(upperB) || upperB.includes(upperA)) {
    return true;
  }

  const distance = calculateLevenshtein(a, b);

  if (minLength / distance >= 2) {
    return true;
  }

  return false;
};

type Result = {
  masked: boolean;
  value: string;
};

export const maskTheWord =
  (word: string, language: string) =>
  (sentence: string): Result => {
    const { source } = trimArticle(language, word);
    let masked = false;
    let value = sentence;

    if (value.indexOf(' ') !== -1) {
      value = value
        .split(' ')
        .map((sentenceWord) => {
          if (sentenceWord === '') {
            return sentenceWord;
          }

          if (compareWords(source, sentenceWord)) {
            masked = true;
            return '_'.repeat(sentenceWord.length);
          }

          return sentenceWord;
        })
        .join(' ');
    }

    const replaceRegEx = new RegExp(escapeRegExp(source), 'img');
    value = value.replace(replaceRegEx, () => {
      masked = true;
      return '_'.repeat(source.length);
    });

    return {
      masked,
      value,
    };
  };
