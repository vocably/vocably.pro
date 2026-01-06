/**
 * Firefox-compatible Auth Storage
 *
 * Since Firefox doesn't support externally_connectable,
 * this storage uses window.postMessage to communicate with
 * the extension's content script bridge.
 *
 * Flow:
 * 1. Web page calls setItem/removeItem/etc
 * 2. This class sends postMessage to the content script (external-bridge.ts)
 * 3. Content script forwards to service worker via runtime.sendMessage
 * 4. Service worker stores in browser.storage.local
 */

import { StorageHelper } from '@aws-amplify/core';

interface ExtensionMessage {
  target: 'vocably-extension';
  identifier: string;
  payload: unknown;
  requestId: string;
}

interface ExtensionResponse {
  target: 'vocably-extension-response';
  requestId: string;
  response?: unknown;
  error?: string;
}

export class FirefoxAppAuthStorage {
  private localStorage: Storage;
  private syncPromise: Promise<void> | null = null;
  private bridgeReady = false;
  private pendingMessages: Array<() => void> = [];

  constructor() {
    this.localStorage = new StorageHelper().getStorage();

    // Listen for bridge ready signal
    window.addEventListener('message', (event) => {
      if (event.data?.target === 'vocably-extension-ready') {
        console.log('[FirefoxAuthStorage] Bridge ready');
        this.bridgeReady = true;
        // Process any pending messages
        this.pendingMessages.forEach((fn) => fn());
        this.pendingMessages = [];
      }
    });
  }

  private sendToExtension(identifier: string, data: unknown): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const requestId = Math.random().toString(36).substring(2);

      const handler = (event: MessageEvent) => {
        const response = event.data as ExtensionResponse | undefined;
        if (response?.target !== 'vocably-extension-response') return;
        if (response?.requestId !== requestId) return;

        window.removeEventListener('message', handler);

        if (response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response.response);
        }
      };

      window.addEventListener('message', handler);

      const message: ExtensionMessage = {
        target: 'vocably-extension',
        identifier,
        payload: data,
        requestId,
      };

      console.log('[FirefoxAuthStorage] Sending:', identifier);
      window.postMessage(message, window.location.origin);

      // Timeout after 5 seconds
      setTimeout(() => {
        window.removeEventListener('message', handler);
        reject(new Error('Extension communication timeout'));
      }, 5000);
    });
  }

  private sendWhenReady(identifier: string, data: unknown): void {
    const send = () => {
      this.sendToExtension(identifier, data).catch((err) => {
        console.warn('[FirefoxAuthStorage] Failed to send to extension:', err);
      });
    };

    if (this.bridgeReady) {
      send();
    } else {
      // Queue the message until bridge is ready
      this.pendingMessages.push(send);
    }
  }

  setItem(key: string, value: string): string {
    this.localStorage.setItem(key, value);
    this.sendWhenReady('authStorage.setItem', { key, value });
    return value;
  }

  getItem(key: string): string | null {
    return this.localStorage.getItem(key);
  }

  removeItem(key: string): void {
    this.localStorage.removeItem(key);
    this.sendWhenReady('authStorage.removeItem', key);
  }

  clear(): void {
    this.localStorage.clear();
    this.sendWhenReady('authStorage.clear', undefined);
  }

  sync(): Promise<void> {
    if (this.syncPromise) {
      return this.syncPromise;
    }

    this.syncPromise = this.sendToExtension('authStorage.getAll', undefined)
      .then((data) => {
        if (data && typeof data === 'object') {
          Object.entries(data as Record<string, string>).forEach(
            ([key, value]) => {
              this.localStorage.setItem(key, value);
            }
          );
        }
      })
      .catch((err) => {
        console.warn('[FirefoxAuthStorage] Sync failed:', err);
      });

    return this.syncPromise;
  }
}
