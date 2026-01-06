# PR 準備指示

## Commit Message

```
docs: add Firefox extension production build guide and debugging notes

- Created FIREFOX_PR_GUIDE.md with comprehensive build instructions
- Documented production environment configuration steps
- Identified authentication blocker requiring upstream web app deployment
- Updated migration doc with afternoon debugging session (13:14-20:12)

Key findings:
- Production build requires manual .env and environmentLocal.ts switching
- Firefox auth needs both extension AND web app (app.vocably.pro) support
- Web app's FirefoxAppAuthStorage may not be deployed to production yet

All dev environment features working:
✅ Translation flow
✅ Language settings
✅ Card operations (add/remove/edit)
✅ Tag operations
✅ AI explanations
✅ UI interactions

Production blocker:
⚠️ Authentication - requires app.vocably.pro deployment
```

## PR 說明模板

```markdown
## 🦊 Add Firefox Extension Support

This PR implements Firefox browser support for the Vocably extension using an iframe-based architecture to work around Firefox's lack of `externally_connectable` API support.

### ✨ Features Implemented

All core features working in **development environment**:
- ✅ Text selection and translation
- ✅ Language selection and persistence  
- ✅ Card management (add, remove, edit)
- ✅ Tag operations (attach, detach, delete, update)
- ✅ AI explanations
- ✅ Click outside to close
- ✅ Popup sizing

### 🏗️ Technical Approach

**iframe Isolation:**
- Content scripts cannot use Stencil.js components directly in Firefox
- Solution: Load components in an iframe (extension page context)
- Communication via `window.postMessage` between content script and iframe

**Key Files:**
- `packages/extension/src/popup-frame/` - iframe UI logic
- `packages/extension-content-script/src/iframe-manager.ts` - iframe lifecycle
- `packages/extension/src/external-bridge.ts` - web ↔ extension bridge
- `packages/extension-content-script/src/message-types.ts` - message definitions

### 📦 Build Instructions

See `FIREFOX_PR_GUIDE.md` for detailed build instructions.

**Quick start (dev):**
```bash
cd packages/extension-popup && npm run build
cd ../extension && TARGET_BROWSER=firefox npm run build:firefox
```

Output: `packages/extension/dist-firefox/`

### ⚠️ Known Issues

**Production Authentication Blocker:**

Firefox authentication requires coordination between:
1. ✅ Extension (implemented) - `external-bridge.ts` + authStorage handlers
2. ❌ Web app (needs deployment) - `FirefoxAppAuthStorage` in `packages/app/`

**Status:**
- Dev environment (localhost:8030): ✅ Auth working
- Production (app.vocably.pro): ❌ Auth not working

**Root cause:**
The production website may not have deployed the Firefox auth support code yet.

**Required action:**
Deploy `packages/app/src/firefox-auth-storage.ts` and related code to app.vocably.pro.

### 🧪 Testing

**Verified in Dev:**
- [x] All translation features
- [x] Card and tag operations
- [x] UI interactions

**Needs Testing:**
- [ ] Production authentication (after web app deployment)
- [ ] Chrome regression testing
- [ ] Cross-platform testing (Windows, Linux)

### 📚 Documentation

- `FIREFOX_PR_GUIDE.md` - Comprehensive guide for maintainers
- `docs/firefox-extension-migration.md` - Detailed implementation notes

### 🤝 Upstream Requirements

To complete Firefox support:

1. **Deploy web app changes** to app.vocably.pro:
   - `packages/app/src/firefox-auth-storage.ts`
   - `packages/app/src/auth-config.ts` (Firefox detection)

2. **Test production environment:**
   - Login flow
   - Card sync to mobile app
   - Welcome/Setup page

3. **Chrome regression test:**
   - Verify no breaking changes to Chrome version

### 💡 Future Improvements

- Automate dev/prod environment switching
- Add production build npm script
- Responsive popup sizing
- Performance optimization

---

**Development Environment:** macOS, Firefox 133+
**Testing Status:** Dev ✅ | Production ⏳
**Chrome Compatibility:** Should be unaffected (needs verification)
```

## Git 指令

```bash
# 檢查狀態
git status

# Stage 所有變更
git add -A

# Commit
git commit -m "docs: add Firefox extension production build guide and debugging notes

- Created FIREFOX_PR_GUIDE.md with comprehensive build instructions
- Documented production environment configuration steps
- Identified authentication blocker requiring upstream web app deployment
- Updated migration doc with afternoon debugging session (13:14-20:12)"

# Push 到你的 fork
git push origin feature/firefox-extension

# 然後在 GitHub 上用上面的說明創建 PR
```

## PR Checklist

### 創建 PR 前
- [ ] 確認 .env 已恢復為 dev 配置（已完成）
- [ ] 檢查 git status 只有預期的變更
- [ ] 再測試一次 dev build
- [ ] 檢查 FIREFOX_PR_GUIDE.md 準確性
- [ ] 準備回答關於 auth blocker 的問題

### PR 創建後
- [ ] 連結相關 issues（如果有）
- [ ] Tag 相關維護者
- [ ] 準備提供 Firefox 架構的額外說明

## 注意事項

### 關於 Production 認證問題

如果上游團隊問起為什麼 production 不能用，你可以這樣解釋：

1. **Firefox 的限制** - 不支援 `externally_connectable`，所以需要 external-bridge
2. **雙向配合** - Extension 和網頁都要有對應的代碼
3. **Extension 端已完成** - 所有 authStorage 處理都實作了
4. **網頁端可能未部署** - `packages/app/` 中的 Firefox 認證代碼可能還沒上 production
5. **Dev 環境驗證** - localhost:8030 有最新代碼，所以認證正常

### 關於建構流程

如果他們覺得建構太複雜，可以建議：

1. 添加 npm scripts 自動化
2. 使用環境變數而非手動複製文件
3. 考慮 CI/CD 整合

### 關於 Chrome 相容性

強調所有 Firefox 特定代碼都有條件判斷：
```typescript
const isFirefox = targetBrowser === 'firefox';
```

不會影響 Chrome 版本，但建議他們做回歸測試確認。
