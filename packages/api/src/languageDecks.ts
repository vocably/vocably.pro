import { LanguageDeck, Result, TagItem } from '@vocably/model';
import { deserializeDeck, serializeDeck } from '@vocably/model-operations';
import { XMLParser } from 'fast-xml-parser';
import { request } from './restClient';

const parser = new XMLParser();

export const saveLanguageDeck = async (
  languageDeck: LanguageDeck
): Promise<Result<null>> => {
  try {
    return await request(`/languages/${languageDeck.language}`, {
      method: 'PUT',
      body: JSON.stringify(serializeDeck(languageDeck)),
    });
  } catch (e) {
    return {
      success: false,
      errorCode: 'LANGUAGE_DECK_SAVE_ERROR',
      reason: 'An error during the saving of a language deck has occurred.',
      extra: e,
    };
  }
};

export const loadLanguageDeck = async (
  language: string
): Promise<Result<LanguageDeck>> => {
  try {
    const result = await request(`/languages/${language}`, {
      method: 'GET',
    });

    if (result.success === false) {
      return result;
    }

    if (!result.value) {
      return {
        success: true,
        value: {
          language,
          cards: [],
          tags: [],
          settings: {},
        },
      };
    }

    return {
      ...result,
      value: deserializeDeck(result.value),
    };
  } catch (e) {
    return {
      success: false,
      errorCode: 'LANGUAGE_DECK_LOAD_ERROR',
      reason: 'An error during the loading of a language deck has occurred.',
      extra: e,
    };
  }
};

export const listLanguages = async (): Promise<Result<string[]>> => {
  try {
    const result = await request(`/languages`, {
      method: 'GET',
    });

    if (result.success === false) {
      return result;
    }

    const jsonResult = parser.parse(result.value);

    let contents = jsonResult?.ListBucketResult?.Contents ?? [];
    if (!Array.isArray(contents)) {
      contents = [contents];
    }

    const languages = contents
      .map((r: any) => r.Key)
      .map((fileName: any) => fileName.split('/').pop());

    return {
      success: true,
      value: languages,
    };
  } catch (e) {
    return {
      success: false,
      errorCode: 'LANGUAGE_DECKS_LIST_ERROR',
      reason:
        'An error during the retrieving of available language decks has occurred.',
      extra: e,
    };
  }
};

export const deleteLanguageDeck = async (
  language: string
): Promise<Result<null>> => {
  try {
    return await request(`/languages/${language}`, {
      method: 'DELETE',
    });
  } catch (e) {
    return {
      success: false,
      errorCode: 'LANGUAGE_DECK_DELETE_ERROR',
      reason: 'An error during the deletion of a language deck has occurred.',
      extra: e,
    };
  }
};

export const deleteTag = async (
  language: string,
  id: string
): Promise<Result<LanguageDeck>> => {
  const loadResult = await loadLanguageDeck(language);

  if (loadResult.success === false) {
    return loadResult;
  }

  const newDeck: LanguageDeck = {
    ...loadResult.value,
    cards: loadResult.value.cards.map((card) => {
      if (!card.data.tags) {
        return card;
      }

      return {
        ...card,
        data: {
          ...card.data,
          tags: card.data.tags.filter((tag) => tag.id !== id),
        },
      };
    }),
    tags: (loadResult.value.tags ?? []).filter((tagItem) => tagItem.id !== id),
  };

  const saveResult = await saveLanguageDeck(newDeck);

  if (saveResult.success === false) {
    return saveResult;
  }

  return {
    success: true,
    value: newDeck,
  };
};

export const updateTag = async (
  language: string,
  tag: TagItem
): Promise<Result<LanguageDeck>> => {
  const loadResult = await loadLanguageDeck(language);

  if (loadResult.success === false) {
    return loadResult;
  }

  const newDeck: LanguageDeck = {
    ...loadResult.value,
    cards: loadResult.value.cards.map((card) => {
      if (!card.data.tags) {
        return card;
      }

      return {
        ...card,
        data: {
          ...card.data,
          tags: card.data.tags.map((cardTag) =>
            cardTag.id === tag.id ? tag : cardTag
          ),
        },
      };
    }),
    tags: (loadResult.value.tags ?? []).map((tagItem) =>
      tagItem.id === tag.id ? tag : tagItem
    ),
  };

  const saveResult = await saveLanguageDeck(newDeck);

  if (saveResult.success === false) {
    return saveResult;
  }

  return {
    success: true,
    value: newDeck,
  };
};
