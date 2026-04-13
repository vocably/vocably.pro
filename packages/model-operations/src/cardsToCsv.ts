import { byDate, CardItem } from '@vocably/model';
import { languageToLexicalaLanguage } from './languageToLexicalaLanguage';

import { Card } from '@vocably/model';

export type Column = Exclude<keyof Card, 'language'>;

export const columnLabels: Record<Column, string> = {
  source: 'Word/Phrase',
  translation: 'Translation',
  partOfSpeech: 'Part of Speech',
  g: 'Gender',
  ipa: 'IPA',
  definition: 'Definition',
  example: 'Example',
  tense: 'Tense',
  presentTenses: 'Present Tenses',
  pastTenses: 'Past Tenses',
  number: 'Number',
  pluralForm: 'Plural Form',
  tags: 'Tags',
};

type Options = {
  cards: CardItem[];
  language: string;
  colDelimiter?: string;
  rowDelimiter?: string;
};

type Result = {
  csv: string;
  lexicalaSkipped: boolean;
};

const getValue = (card: CardItem, column: Column): string => {
  if (column === 'tags') {
    return card.data.tags.map((t) => t.data.title).join(', ');
  }

  return card.data[column] ?? '';
};

const getColumns = (cards: CardItem[]): Column[] => {
  return (Object.keys(columnLabels) as Column[]).filter((column) => {
    return cards.some((card) => !!getValue(card, column));
  });
};

const prepareColumn = (
  value: string,
  colDelimiter: string,
  rowDelimiter: string
): string => {
  if (
    !value.includes('\n') &&
    !value.includes('\t') &&
    !value.includes(colDelimiter) &&
    !value.includes(rowDelimiter)
  ) {
    return value;
  }

  return `"${value.replace(/\"/gm, '""')}"`;
};

export const cardsToCsv = ({
  cards: c,
  language,
  colDelimiter = `\t`,
  rowDelimiter = `\n`,
}: Options): Result => {
  const isLexicalaLanguage = languageToLexicalaLanguage(language) !== null;
  const cards = c.sort(byDate).filter((card) => {
    if (isLexicalaLanguage) {
      // Lexicala was disabled on 27/10/2025 at 09:33:44 UTC
      return card.created > 1761557624697;
    }

    return true;
  });

  const lexicalaSkipped = cards.length < c.length;

  const columns = getColumns(cards);

  const csv = [
    columns.map((column) => columnLabels[column]).join(colDelimiter),
    ...cards.map((card) => {
      return columns
        .map((column) => {
          return prepareColumn(
            getValue(card, column),
            colDelimiter,
            rowDelimiter
          );
        })
        .join(colDelimiter);
    }),
  ].join(rowDelimiter);

  return {
    csv,
    lexicalaSkipped,
  };
};
