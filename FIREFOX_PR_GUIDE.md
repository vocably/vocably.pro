# Firefox Extension Support - Implementation Guide

## Overview

This PR adds Firefox browser support to the Vocably extension. Since Firefox doesn't support Chrome's `externally_connectable` API, we implemented an iframe-based alternative solution.

## Completed Features

### ✅ Core Functionality
- **Translation API Integration** - Complete analyze → result flow
- **Language Settings** - Persist and auto-retranslate
- **Card Operations** - + Learn, edit, delete
- **Tag Operations** - Attach/detach/delete/update tags (with Promise returns)
- **AI Explanations** - Display detailed explanations
- **UI Features** - Click outside to close, popup sizing

### 🏗️ Technical Implementation

#### 1. iframe Isolation Architecture
Due to Firefox content script limitations, we use an iframe to load Stencil.js components:

- `popup-frame.html` - iframe in extension page context
- `popup-frame.ts` - Handles UI logic and postMessage communication
- `iframe-manager.ts` - Manages iframe lifecycle in content script

#### 2. Message Passing
Uses `window.postMessage` for content script ↔ iframe communication:

**New Message Types:**
- `TRANSLATE`, `TRANSLATION_RESULT`, `TRANSLATION_ERROR`
- `CHANGE_LANGUAGE`
- `ADD_CARD`, `REMOVE_CARD`, `CARD_RESULT`
- `ATTACH_TAG`, `DETACH_TAG`, `DELETE_TAG`, `UPDATE_TAG`, `UPDATE_CARD`
- `EXPLANATION_RESULT`
- `RESIZE_FRAME`

#### 3. Request/Response Mechanism
Implemented requestId correlation for Promise returns (tag operations).

## Build Instructions

### Development Build
```bash
# 1. Build popup (Angular)
cd packages/extension-popup
npm run build

# 2. Build Firefox extension
cd packages/extension
TARGET_BROWSER=firefox npm run build:firefox
```

Output directory: `packages/extension/dist-firefox/`

### Production Build
```bash
# 1. Prepare environment
cd packages/extension
cp .env.prod .env

# 2. Build popup
cd ../extension-popup
cp src/environments/environmentLocal.prod.ts src/environments/environmentLocal.ts
NODE_ENV=prod npm run build

# 3. Build extension
cd ../extension
rm dist-firefox/manifest.json  # Ensure manifest regeneration
NODE_ENV=prod TARGET_BROWSER=firefox npm run build:firefox

# 4. Restore dev environment (optional)
cp .env.dev .env
cd ../extension-popup
cp src/environments/environmentLocal.dev.ts src/environments/environmentLocal.ts
```

## Known Issues & Limitations

### ⚠️ Production Authentication Blocker

**Issue:**
In production environment (api.vocably.pro), users cannot authenticate. Extension shows "not logged in" after login.

**Root Cause:**
Firefox authentication requires coordination between web app and extension:

1. ✅ **Extension side** - Implemented
   - `external-bridge.ts` listens for web messages
   - `service-worker.ts` handles `authStorage.setItem/removeItem/clear`
   
2. ❌ **Web app side** - May not be deployed to production
   - `packages/app/src/firefox-auth-storage.ts` sends auth tokens
   - `packages/app/src/auth-config.ts` Firefox detection logic

**Verification:**
After logging in at app.vocably.pro, console should show:
```
[FirefoxAuthStorage] Bridge ready
[Vocably Bridge] Received message: authStorage.setItem
[ServiceWorker] authStorage.setItem: @Auth_...
```

If these messages don't appear, the production website hasn't deployed Firefox support.

**Solution:**
Deploy web app changes to app.vocably.pro (see "Required Actions" below).

### 📋 Other Limitations

1. **Popup Size** - Fixed px values (480x380) instead of responsive
2. **iframe Overhead** - Slightly heavier than Chrome's native approach
3. **Dev/Prod Switching** - Requires manual .env file modification

## Required Actions from Upstream Team

### 1. Deploy Web App Firefox Support

Ensure production website (app.vocably.pro) includes:
- `packages/app/src/firefox-auth-storage.ts`
- `packages/app/src/auth-config.ts` Firefox detection logic

### 2. Test Production Environment

Recommended testing flow:
1. Deploy updated app.vocably.pro
2. Use production build of Firefox extension
3. Test complete login flow
4. Verify card sync to mobile app

### 3. Build Process Optimization

Consider adding:
```json
// package.json
{
  "scripts": {
    "build:firefox:prod": "NODE_ENV=prod TARGET_BROWSER=firefox npm run build:firefox"
  }
}
```

And automate environment file switching.

## File Structure

### New Files
```
packages/extension/src/
├── external-bridge.ts          # Firefox web ↔ extension bridge
├── firefox-polyfill.ts         # Firefox API polyfills
└── popup-frame/
    ├── popup-frame.html        # iframe HTML
    └── popup-frame.ts          # iframe logic

packages/extension-content-script/src/
├── iframe-manager.ts           # iframe lifecycle management
└── message-types.ts            # postMessage type definitions
```

### Modified Files
```
packages/extension/src/
├── content-script.ts           # Added iframe initialization
├── service-worker.ts           # Added authStorage handlers
└── manifest.firefox.json.txt   # Firefox manifest

packages/extension/webpack.config.js  # Firefox build config
```

## Testing Recommendations

### Dev Environment (Verified ✅)
- [x] Text selection shows button
- [x] Button click shows translation
- [x] Language switching
- [x] + Learn functionality
- [x] Tag add/remove
- [x] AI explanation display
- [x] Click outside to close

### Production Environment (Pending ⏳)
- [ ] Login flow
- [ ] API calls
- [ ] Card sync to mobile app
- [ ] Welcome/Setup page

## Chrome Compatibility

All changes use conditional logic and don't affect Chrome:
```typescript
const isFirefox = targetBrowser === 'firefox';
```

Recommend Chrome regression testing before merge.

## Contact

For questions, see:
- Detailed implementation notes: `docs/firefox-extension-migration.md`
- Original issue/discussion (if applicable)

---

**Build Date:** 2025-12-17
**Test Environment:** macOS, Firefox 133+
**Developer:** @gjrobert aka @aiuanyu (with AI assistance)
