import { GoogleLanguage, languageList } from '@vocably/model';
import { i18n } from '../i18n';
import { upperFirst } from 'lodash-es';

export type LanguageListItem = {
  selected: boolean;
  key: string;
  label: string;
  alias: string;
};

export type LanguageList = {
  title: string;
  data: LanguageListItem[];
}[];

export const createLanguageList = ({
  selected,
  preferred,
  preferredTitle,
  searchText,
}: {
  selected: string;
  preferred: string[];
  preferredTitle: string;
  searchText: string;
}): LanguageList => {
  const data: LanguageList = [];

  const allLanguages = Object.keys(languageList)
    .map((key) => ({
      key,
      alias: languageList[key as GoogleLanguage],
      label: i18n.t(`language.nominative_${key}`),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const filteredLanguageList = Object.fromEntries(
    allLanguages
      .filter(({ key, alias, label }) =>
        `${label} ${alias}`.toLowerCase().includes(searchText.toLowerCase())
      )
      .map(({ key, alias }) => [key, alias])
  );

  if (selected && filteredLanguageList[selected as GoogleLanguage]) {
    data.push({
      title: i18n.t('languageSelector.selected'),
      data: [
        {
          key: selected,
          label: upperFirst(i18n.t(`language.nominative_${selected}`)),
          alias: filteredLanguageList[selected as GoogleLanguage],
          selected: true,
        },
      ],
    });
  }

  const filteredPreferred = preferred
    .filter((l) => l !== selected)
    .filter((l) => filteredLanguageList[l] !== undefined);

  if (filteredPreferred.length > 0) {
    data.push({
      title: preferredTitle,
      data: filteredPreferred.map((key) => ({
        key,
        selected: false,
        label: upperFirst(i18n.t(`language.nominative_${key}`)),
        alias: filteredLanguageList[key as GoogleLanguage],
      })),
    });
  }

  data.push({
    title: i18n.t('languageSelector.availableLanguages'),
    data: Object.entries(filteredLanguageList).map(([key, alias]) => ({
      key,
      label: upperFirst(i18n.t(`language.nominative_${key}`)),
      alias,
      selected: false,
    })),
  });

  return data;
};
