import { useEffect, useRef } from 'react';
import * as asyncAppStorage from '../asyncAppStorage';
import { LanguageDeckTransformation } from '../deckTransformations';
import { getStorageId, isAnonymousUser } from '../getStorageId';
import { useAsync } from '../useAsync';

type TransformationsCollection = {
  [language: string]: LanguageDeckTransformation[];
};

export const loadTransformationsFromStorage =
  async (): Promise<TransformationsCollection> => {
    const storageIdResult = await getStorageId();
    if (!storageIdResult.success) {
      return {};
    }

    const key = `${storageIdResult.value}.languageTransformations`;

    const collection = await asyncAppStorage.getItem(key);

    if (!collection) {
      return {};
    }

    return JSON.parse(collection);
  };

const saveTransformationsToStorage = async (
  collection: TransformationsCollection
) => {
  const storageIdResult = await getStorageId();

  if (storageIdResult.success === false) {
    return;
  }

  const key = `${storageIdResult.value}.languageTransformations`;

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
    saveTransformations: async () => {
      const isAnonymous = await isAnonymousUser();

      if (isAnonymous) {
        return;
      }

      return saveTransformationsToStorage(transformationsRef.current);
    },
    deleteTransformations: async (language: string) => {
      transformationsRef.current[language] = [];

      const isAnonymous = await isAnonymousUser();

      if (isAnonymous) {
        return;
      }

      return saveTransformationsToStorage(transformationsRef.current);
    },
  };
};
