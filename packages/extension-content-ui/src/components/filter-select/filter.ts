import { FilterSelectGroup, FilterSelectOption } from './types';

export const normalize = (text: string): string =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const NO_MATCH = Number.POSITIVE_INFINITY;

/**
 * Lower is better: 0 - exact match, 1 - the text starts with the query,
 * 2 - one of the words starts with the query, 3 - substring match.
 */
const scoreText = (text: string, query: string): number => {
  const normalized = normalize(text);

  if (normalized === query) {
    return 0;
  }

  if (normalized.startsWith(query)) {
    return 1;
  }

  if (normalized.split(/[\s()\-,/]+/).some((word) => word.startsWith(query))) {
    return 2;
  }

  if (normalized.includes(query)) {
    return 3;
  }

  return NO_MATCH;
};

const scoreOption = (option: FilterSelectOption, query: string): number => {
  // The label is what the visitor sees, so it wins over an equally good alias.
  const labelScore = scoreText(option.label, query) * 2;
  const aliasScore = Math.min(
    NO_MATCH,
    ...(option.aliases ?? []).map((alias) => scoreText(alias, query) * 2 + 1)
  );

  return Math.min(labelScore, aliasScore);
};

/**
 * Keeps the groups whose options match the query. Within a group the options
 * are ordered by how well they match, the original order breaking ties.
 */
export const filterGroups = (
  groups: FilterSelectGroup[],
  rawQuery: string
): FilterSelectGroup[] => {
  const query = normalize(rawQuery);

  if (query === '') {
    return groups;
  }

  return groups
    .map((group) => ({
      ...group,
      options: group.options
        .map((option, index) => ({
          option,
          index,
          score: scoreOption(option, query),
        }))
        .filter(({ score }) => score !== NO_MATCH)
        .sort((a, b) => a.score - b.score || a.index - b.index)
        .map(({ option }) => option),
    }))
    .filter((group) => group.options.length > 0);
};
