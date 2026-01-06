import { Auth } from '@aws-amplify/auth';
import { registerServiceWorker } from '@vocably/extension-service-worker';
import { registerExtensionStorage } from '@vocably/pontis';
import './browserEnvPatch'; // Must import first to patch chrome.storage in Firefox
import { browserEnv } from './browserEnv';

// Create storage at module level so it can be accessed by onMessage handler
const storage = registerExtensionStorage('local');

// Firefox: Handle messages from content script bridge (external-bridge.ts)
// This is needed because Firefox doesn't support externally_connectable
// IMPORTANT: Keys are stored with @Auth_ prefix to match @vocably/pontis format
const AUTH_KEY_PREFIX = '@Auth_';

// Track if we need to re-sync after external writes
let needsResync = false;

browserEnv.runtime.onMessage.addListener(
  (
    message: any,
    _sender: any,
    sendResponse: (response: any) => void
  ): boolean | void => {
    if (!message || typeof message.identifier !== 'string') {
      return false;
    }
    
    const { identifier, data } = message as { identifier: string; data: unknown };

    // Handle authStorage messages
    if (identifier === 'authStorage.setItem') {
      const { key, value } = data as { key: string; value: string };
      const storageKey = `${AUTH_KEY_PREFIX}${key}`;
      browserEnv.storage.local.set({ [storageKey]: value }).then(async () => {
        console.log('[ServiceWorker] authStorage.setItem:', storageKey);
        // Re-sync to update dataMemory so Auth.currentSession() can find tokens
        needsResync = true;
        // Force re-sync by clearing the syncPromise and calling sync again
        // @ts-ignore
        storage.syncPromise = null;
        await storage.sync();
        console.log('[ServiceWorker] Storage re-synced after setItem');
        sendResponse({ success: true });
      });
      return true; // Keep the message channel open for async response
    }

    if (identifier === 'authStorage.removeItem') {
      const key = data as string;
      const storageKey = `${AUTH_KEY_PREFIX}${key}`;
      browserEnv.storage.local.remove(storageKey).then(async () => {
        console.log('[ServiceWorker] authStorage.removeItem:', storageKey);
        // @ts-ignore
        storage.syncPromise = null;
        await storage.sync();
        sendResponse({ success: true });
      });
      return true;
    }

    if (identifier === 'authStorage.clear') {
      // Only clear keys with @Auth_ prefix
      (browserEnv.storage.local.get() as Promise<{ [key: string]: any }>).then(async (items) => {
        const authKeys = Object.keys(items).filter(k => k.startsWith(AUTH_KEY_PREFIX));
        await browserEnv.storage.local.remove(authKeys);
        console.log('[ServiceWorker] authStorage.clear:', authKeys.length, 'keys');
        // @ts-ignore
        storage.syncPromise = null;
        await storage.sync();
        sendResponse({ success: true });
      });
      return true;
    }

    if (identifier === 'authStorage.getAll') {
      (browserEnv.storage.local.get() as Promise<{ [key: string]: any }>).then((items) => {
        // Return keys without the @Auth_ prefix
        const authItems: { [key: string]: any } = {};
        Object.entries(items).forEach(([key, value]) => {
          if (key.startsWith(AUTH_KEY_PREFIX)) {
            authItems[key.replace(AUTH_KEY_PREFIX, '')] = value;
          }
        });
        console.log('[ServiceWorker] authStorage.getAll:', Object.keys(authItems).length, 'keys');
        sendResponse(authItems);
      });
      return true;
    }

    if (identifier === 'ping') {
      sendResponse('pong');
      return false;
    }

    // Let other handlers process the message
    return false;
  }
);

// Initialize storage and sync, then register service worker
(async () => {
  // CRITICAL: Sync storage before Auth.configure()
  // This loads existing tokens from browser.storage into memory
  // Without this, Auth falls back to localStorage
  await storage.sync();

  registerServiceWorker({
    auth: {
      region: process.env.AUTH_REGION,
      userPoolId: process.env.AUTH_USER_POOL_ID,
      userPoolWebClientId: process.env.AUTH_USER_POOL_WEB_CLIENT_ID,
      storage,
    },
    api: {
      baseUrl: process.env.API_BASE_URL,
      region: process.env.API_REGION,
      cardsBucket: process.env.API_CARDS_BUCKET,
      getJwtToken: () => {
        return Auth.currentSession().then((session) =>
          session.getIdToken().getJwtToken()
        );
      },
    },
    facility: 'chrome-or-safari',
  });
})();

browserEnv.contextMenus.create({
  id: 'context-menu-item',
  title: 'Translate with Vocably',
  contexts: ['selection'],
});

browserEnv.contextMenus.onClicked.addListener((info, tab) => {
  console.log('[ServiceWorker] Context menu clicked, tab:', tab?.id);
  if (!tab?.id) {
    console.error('[ServiceWorker] No tab ID available');
    return;
  }
  browserEnv.tabs.sendMessage(tab.id, {
    action: 'contextMenuTranslateClicked',
  }).then(() => {
    console.log('[ServiceWorker] Message sent to tab');
  }).catch((err: Error) => {
    console.error('[ServiceWorker] Failed to send message to tab:', err.message);
  });
});

browserEnv.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    await browserEnv.tabs.create({
      url: `${process.env.APP_BASE_URL}/page/welcome`,
    });
  }
});

browserEnv.runtime.setUninstallURL('https://app.vocably.pro/page/uninstall');

// @ts-ignore
window.clearStorage = () => {
  browserEnv.storage.local.clear();
};

// @ts-ignore - Debug function to test Auth.currentSession()
window.testAuth = async () => {
  console.log('=== Testing Auth.currentSession() ===');
  try {
    const session = await Auth.currentSession();
    console.log('✅ Session found!');
    console.log('- Access Token:', session.getAccessToken().getJwtToken().substring(0, 50) + '...');
    console.log('- ID Token:', session.getIdToken().getJwtToken().substring(0, 50) + '...');
    return true;
  } catch (err) {
    console.log('❌ No session:', (err as Error).message);
    return false;
  }
};

// @ts-ignore - Debug function to test storage.getItem()
window.testStorage = async () => {
  console.log('=== Testing Storage ===');
  // @ts-ignore
  const allKeys = await storage.getAll();
  console.log('storage.getAll() keys:', Object.keys(allKeys).length);
  Object.keys(allKeys).forEach(k => console.log(' -', k));
  
  // Test getItem for a specific key
  const lastAuthUserKey = Object.keys(allKeys).find(k => k.includes('LastAuthUser'));
  if (lastAuthUserKey) {
    // @ts-ignore
    const value = storage.getItem(lastAuthUserKey);
    console.log('storage.getItem("' + lastAuthUserKey + '"):', value);
  } else {
    console.log('No LastAuthUser key found');
  }
  
  return allKeys;
};

// @ts-ignore - Force re-sync and test
window.forceSync = async () => {
  console.log('=== Force Re-sync ===');
  // @ts-ignore
  storage.syncPromise = null;
  await storage.sync();
  console.log('Sync completed');
  // @ts-ignore
  return window.testStorage();
};
