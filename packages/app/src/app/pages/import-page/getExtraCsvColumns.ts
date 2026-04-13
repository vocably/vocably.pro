import { Column, columnLabels } from '@vocably/model-operations';
import { CsvData } from './getCsvData';

const columnsToExclude = [
  'source',
  'translation',
  'partOfSpeech',
  'tags',
] as const;

export type SafeColumn = Exclude<Column, (typeof columnsToExclude)[number]>;

export const getExtraCsvColumns = (csvData: CsvData): SafeColumn[] => {
  return Object.keys(columnLabels)
    .filter((column): column is SafeColumn => {
      // @ts-ignore
      return !columnsToExclude.includes(column);
    })
    .filter((column) => {
      return csvData.some((csvItem) => !!csvItem[column]);
    });
};
