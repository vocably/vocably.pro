import { useEffect, useRef } from 'react';
import * as asyncAppStorage from '../asyncAppStorage';
import { LanguageDeckTransformation } from '../deckTransformations';
import { getStorageId } from '../getStorageId';
import { useAsync } from '../useAsync';

type TransformationsCollection = {
  [language: string]: LanguageDeckTransformation[];
};

export const loadTransformationsFromStorage =
  async (): Promise<TransformationsCollection> => {
    const userSubResult = await getStorageId();
    if (!userSubResult.success) {
      return {};
    }

    const key = `${userSubResult.value}.languageTransformations`;

    // ToDo: remove this after a while
    const oldKey = 'languageTransformations';
    const oldDecks = await asyncAppStorage.getItem(oldKey);
    if (oldDecks) {
      await asyncAppStorage.removeItem(oldKey);
      await asyncAppStorage.setItem(key, oldDecks);
    }
    // EndOfToDo

    const collection = await asyncAppStorage.getItem(key);

    if (!collection) {
      return {};
    }

    return JSON.parse(collection);
  };

const saveTransformationsToStorage = async (
  collection: TransformationsCollection
) => {
  const userSubResult = await getStorageId();

  if (userSubResult.success === false) {
    return;
  }

  const key = `${userSubResult.value}.languageTransformations`;

  await asyncAppStorage.setItem(key, JSON.stringify(collection));
};

type Return = {
  areLoaded: boolean;
  getTransformations: (language: string) => LanguageDeckTransformation[];
  saveTransformations: () => Promise<void>;
  deleteTransformations: (language: string) => Promise<void>;
};

export const useLanguageTransformations = (): Return => {
  const [transformationsResult] = useAsync(loadTransformationsFromStorage);
  const transformationsRef = useRef<TransformationsCollection>({});

  useEffect(() => {
    if (transformationsResult.status === 'loaded') {
      transformationsRef.current = {
        ...transformationsRef.current,
        ...transformationsResult.value,
      };
    }
  }, [transformationsResult.status]);

  return {
    areLoaded: transformationsResult.status === 'loaded',
    getTransformations: (language: string) => {
      if (!transformationsRef.current[language]) {
        transformationsRef.current[language] = [];
      }

      return transformationsRef.current[language];
    },
    saveTransformations: () =>
      saveTransformationsToStorage(transformationsRef.current),
    deleteTransformations: (language: string) => {
      transformationsRef.current[language] = [];
      return saveTransformationsToStorage(transformationsRef.current);
    },
  };
};
