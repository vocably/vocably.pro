import { KeyValueStorageInterface } from '@aws-amplify/core';
import * as asyncAppStorage from '../asyncAppStorage';

type AuthCollection = Record<string, string>;

const storageKey = 'auth';

export class AuthStorage implements KeyValueStorageInterface {
  private collection: AuthCollection | null = null;
  private loaded: Promise<void> | null = null;

  private load = (): Promise<void> => {
    if (!this.loaded) {
      this.loaded = asyncAppStorage.getItem(storageKey).then((raw) => {
        this.collection = JSON.parse(raw ?? '{}');
      });
    }
    return this.loaded;
  };

  private persist = async () => {
    await asyncAppStorage.setItem(
      storageKey,
      JSON.stringify(this.collection ?? {})
    );
  };

  async setItem(key: string, value: string) {
    await this.load();
    this.collection![key] = value;
    await this.persist();
  }

  async getItem(key: string) {
    await this.load();
    return this.collection![key] ?? null;
  }

  async removeItem(key: string) {
    await this.load();
    delete this.collection![key];
    await this.persist();
  }

  async clear() {
    await asyncAppStorage.removeItem(storageKey);
    this.collection = {};
  }
}
