export type FilterSelectOption = {
  value: string;
  label: string;
  /**
   * Extra strings the option is found by when filtering,
   * e.g. a language code, its English and its native name.
   */
  aliases?: string[];
};

export type FilterSelectGroup = {
  /** An empty label renders the options without a group header. */
  label: string;
  options: FilterSelectOption[];
};
