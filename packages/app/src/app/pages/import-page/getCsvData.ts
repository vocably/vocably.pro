import { Card } from '@vocably/model';
import { Column, columnLabels } from '@vocably/model-operations';

type CsvDataItem = Pick<Card, 'source' | 'translation'> &
  Partial<Pick<Card, Exclude<Column, 'source' | 'translation' | 'tags'>>>;

export type CsvData = CsvDataItem[];

const isHeader = (items: string[]): boolean => {
  const labels = Object.values(columnLabels).map((c) => c.toLowerCase());
  return items.every((item) => labels.includes(item.toLowerCase()));
};

const excludedColumns = ['tags'] as const;

type ColumnMap = Partial<
  Record<Exclude<Column, (typeof excludedColumns)[number]>, number>
>;

const getColumnMap = (header: string[]): Partial<Record<Column, number>> => {
  return Object.entries(columnLabels).reduce((acc, [column, label]) => {
    // @ts-ignore
    if (excludedColumns.includes(column)) {
      return acc;
    }
    const index = header.findIndex(
      (headerLabel) => headerLabel.toLowerCase() === label.toLowerCase()
    );
    if (index === -1) {
      return acc;
    } else {
      return {
        ...acc,
        [column]: index,
      };
    }
  }, {});
};

type CsvDataColumnMap = {
  source: string;
  translation: string;
} & ColumnMap;

const isCsvDataColumnMap = (
  columnMap: ColumnMap
): columnMap is CsvDataColumnMap => {
  return columnMap.source !== undefined && columnMap.translation !== undefined;
};

export const getCsvData = (csv: string[][]): CsvData => {
  const hasHeader = isHeader(csv[0]);
  const columnMap: ColumnMap = hasHeader
    ? getColumnMap(csv[0])
    : {
        source: 0,
        translation: 1,
        partOfSpeech: 2,
      };

  if (!isCsvDataColumnMap(columnMap)) {
    return [];
  }

  const csvDataWithoutHeader = hasHeader ? csv.slice(1) : csv;

  return csvDataWithoutHeader
    .map((csvRow) => {
      const csvDataItem: CsvDataItem = {
        source: csvRow[columnMap.source],
        translation: csvRow[columnMap.translation],
      };

      return Object.entries(columnMap).reduce((acc, [key, index]) => {
        return {
          ...acc,
          [key]: csvRow[index],
        };
      }, csvDataItem);
    })
    .filter((c) => c.source && c.translation);
};
