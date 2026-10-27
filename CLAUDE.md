# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vocably is a language-learning tool that enables users to translate words/phrases while reading (across browser extensions, mobile apps, and web platforms) and learn them through flashcards with spaced repetition. The project is structured as an npm workspaces monorepo with AWS infrastructure managed via Terraform.

## Common Development Commands

### Initial Setup

```bash
npm ci --force                           # Install all dependencies (root + workspaces)
npx zx ./scripts/build-packages.mjs     # Build all shared packages in dependency order
```

### Building Packages

```bash
# Build all packages in correct dependency order
npx zx ./scripts/build-packages.mjs

# Build individual package (from package directory)
cd packages/model && npm run build      # TypeScript dual build (ESM + CommonJS)
cd packages/extension && npm run build  # Webpack production build
cd packages/backend && npm run build    # Lambda webpack bundle

# Watch mode for development
cd packages/model && npm start          # Watch both ESM and CommonJS
cd packages/extension && npm start      # Webpack watch mode
```

### Testing

```bash
# Run all tests across workspaces
npm run test -ws -- --runInBand --silent

# Run tests for specific package
cd packages/sulna && npm test           # Jest tests
cd packages/analyze && npm test         # Jest tests with .env.test

# Run single test file
cd packages/backend && npm test -- src/analyze.test.ts
```

### Infrastructure & Deployment

```bash
# Terraform deployment (requires environment setup)
cd platform
terraform init
terraform workspace select dev
terraform plan -var-file="env-dev.tfvars"
terraform apply -var-file="env-dev.tfvars" -auto-approve

# Deploy mobile apps (from root)
npm run deploy-ios-dev --prefix=./mobile-app    # iOS to TestFlight
npm run deploy-ios-prod --prefix=./mobile-app   # iOS production
npm run deploy-android --prefix=./mobile-app    # Android to Play Store
```

## Monorepo Architecture

### Package Build Dependencies

Packages must be built in this order (handled by `build-packages.mjs`):

1. **jest** - Shared Jest configuration
2. **sulna** - Core utilities (string processing, tokenization, date helpers)
3. **node-sulna** - Node.js-specific utilities
4. **model** - TypeScript types for entire system (dual ESM/CommonJS output)
5. **model-operations** - Operations on domain models
6. **srs** - Spaced Repetition System algorithm
7. **webpack** - Shared webpack utilities
8. **crud** - DynamoDB CRUD operations
9. **api** - REST API client library
10. **lambda-shared** - Shared Lambda utilities
11. **analyze** - Word/phrase analysis and translation logic
12. **browser** - Browser API compatibility layer
13. **extension-stay-alive** - Keep extension alive utility
14. **extension-messages** - Extension message passing protocol
15. **extension-service-worker** - Background service worker logic
16. **extension-content-ui** - StencilJS web components for UI
17. **extension-content-script** - Content script for text selection

### Main Applications

#### Browser Extensions

- **`packages/extension`** - Chrome/Edge Manifest V3 extension (webpack)
- **`packages/safari-extension`** - Safari desktop extension
- **`packages/ios-extension`** - iOS Safari extension (embedded in mobile app)

#### Mobile Application

- **`mobile-app/`** - React Native 0.77.3 app (iOS & Android)
  - See `mobile-app/CLAUDE.md` for mobile-specific guidance
  - Dependencies: `@vocably/api`, `@vocably/model`
  - Auth: AWS Amplify (Cognito)
  - Purchases: RevenueCat
  - Analytics: PostHog, Sentry

#### Web Applications

- **`packages/www`** - Marketing website (webpack, S3/CloudFront)
- **`packages/app`** - Angular 19 dashboard application
- **`packages/extension-popup`** - Angular 19 extension popup UI

#### Backend Services (AWS Lambda)

- **`packages/backend`** - Main API lambdas (analyze, explain, bulk-analyze, chat-with-card, onboard, play-sound, user-feedback, notifications, etc.)
- **`packages/auth-lambdas`** - Cognito trigger lambdas
- **`packages/www-backend`** - Paddle & RevenueCat webhook handlers
- **`packages/public-backend`** - Public API endpoints (no auth)

### Shared Packages

- **`@vocably/model`** - Core TypeScript types (analysis, language, translation-cards, user, notifications, study-stats, etc.)
- **`@vocably/api`** - REST API client used by mobile/web/extensions
- **`@vocably/analyze`** - Translation and dictionary lookup logic (Google Translate integration)
- **`@vocably/srs`** - Spaced repetition algorithm for flashcards
- **`@vocably/crud`** - DynamoDB operations
- **`@vocably/model-operations`** - Domain model manipulation utilities
- **`@vocably/sulna`** - String utilities (tokenization, extractTranslation, trimArticle, sanitizeTranscript)
- **`@vocably/browser`** - Browser API compatibility (Chrome/Firefox)
- **`@vocably/extension-*`** - Extension-specific modules (content-script, service-worker, content-ui, messages, stay-alive)
- **`@vocably/webpack`** - Shared webpack configuration
- **`@vocably/jest`** - Shared Jest configuration
- **`@vocably/lambda-shared`** - Shared Lambda utilities

## Infrastructure (AWS Terraform)

### Key Resources (managed in `/platform`)

- **API Gateway REST APIs**:
  - `api.vocably.pro` - Main authenticated API (Cognito authorizer)
  - `www-api.vocably.pro` - Webhook handlers (Paddle, RevenueCat)
  - `public-api.vocably.pro` - Public endpoints (no auth)
- **Lambda Functions**: Backend services (18+ functions)
- **Cognito User Pools**: Authentication
- **DynamoDB**: User data, cards, decks, backups
- **S3 Buckets**: Static hosting, user files, artifacts, audio files
- **CloudFront**: CDN distributions
- **Route53**: DNS management
- **SNS**: Notifications and alarms
- **AWS Pinpoint**: Push notifications (mobile)

### Environments

- **dev** - Development environment
- **prod** - Production environment

Managed via Terraform workspaces with separate `.tfvars` files (`env-dev.tfvars`, `env-prod.tfvars`).

### Deployment Flow

**On push to `main` branch (CI/CD via CircleCI):**

1. Install dependencies
2. Build all packages
3. Run tests across workspaces
4. Deploy infrastructure via Terraform (dev environment)
5. Run semantic-release (version bump, changelog, git tags)
6. Build and upload extension

**On version tags (`v*.*.*`):**

1. Same as main branch
2. Requires manual approval
3. Deploys to production environment

## API Communication

### REST API Structure

All APIs use types from `@vocably/model`. Client library: `@vocably/api`.

**Main API** (`api.vocably.pro`) - Authenticated (JWT from Cognito):

- `POST /analyze` - Translate word/phrase
- `POST /analyze-units-of-speech` - Grammar analysis
- `POST /generate-units-of-speech` - AI grammar generation
- `POST /bulk-analyze` - Batch translations
- `POST /explain` - Sentence explanations
- `POST /chat-with-card` - AI chat about flashcards
- `POST /play-sound` - Text-to-speech
- `POST /onboard` - User onboarding
- `POST /user-feedback` - Feedback submission
- `GET/POST/PUT/DELETE /languages/*` - Language deck CRUD
- `GET/PUT /user-files/*` - User file storage (S3)
- `POST /notification-time/*` - Notification scheduling
- `POST /recalibrate-notifications` - Recalibrate push notifications

**Public API** (`public-api.vocably.pro`) - No authentication:

- `POST /analyze`
- `POST /play-sound`
- `POST /user-feedback`

**WWW API** (`www-api.vocably.pro`) - Webhooks:

- `POST /paddle` - Paddle payment webhooks
- `POST /revenue-cat` - RevenueCat subscription webhooks

### External Services

- **Google Cloud Translation API** - Translation service
- **Google Cloud Text-to-Speech** - Audio pronunciation
- **Google Generative AI (Gemini)** - AI explanations and chat
- **OpenAI** - Alternative AI provider
- **AWS Pinpoint** - Push notifications
- **Sentry** - Error tracking
- **PostHog** - Analytics
- **RevenueCat** - In-app purchase management (mobile)
- **Paddle** - Subscription billing (web)

## Development Patterns

### Type System

All domain types are defined in `@vocably/model`. Import from this package:

```typescript
import {
  Result,
  Language,
  LanguageDeck,
  TranslationCard,
  AnalysisPayload,
  isSuccess,
  isError,
} from '@vocably/model';
```

### Dual Module Format

Most shared packages export both ESM and CommonJS:

- **ESM**: `dist/esm/index.js` (for modern bundlers, React Native)
- **CommonJS**: `dist/commonjs/index.js` (for Node.js, Lambdas)

Built via dual `tsc` invocations in `package.json`:

```json
{
  "scripts": {
    "build": "tsc && tsc --project tsconfig.commonjs.json"
  }
}
```

### Testing Strategy

- Jest configured via `@vocably/jest` package
- Tests co-located with source: `*.test.ts` or `*.spec.ts`
- Run with `npm test` in package directory
- CI runs all tests with `npm run test -ws -- --runInBand --silent`

### Watch Mode Development

For active development on a package:

```bash
cd packages/model && npm start    # Runs both ESM and CommonJS watch
cd packages/extension && npm start # Webpack watch with HMR
```

### Extension Development

Browser extensions communicate through:

1. **Content Script** (`extension-content-script`) - Detects text selection
2. **Service Worker** (`extension-service-worker`) - Background message handling
3. **Messages** (`extension-messages`) - Message protocol definitions
4. **Content UI** (`extension-content-ui`) - StencilJS web components
5. **API Client** (`@vocably/api`) - Backend communication

### Lambda Development

Lambda functions:

- Use webpack to bundle dependencies
- Import shared code from `@vocably/lambda-shared`
- Use types from `@vocably/model`
- Use business logic from `@vocably/analyze`, `@vocably/srs`, etc.
- Deploy via Terraform which packages as `.zip` files

## Important Conventions

### Package Naming

- Published packages: `@vocably/package-name`
- All packages are currently private (not published to npm)
- External published packages: `@vocably/pontis`, `@vocably/hermes`

### Environment Variables

- Root `.env` files for different environments
- Mobile app: `react-native-dotenv` (`.env.dev`, `.env.prod`)
- Backend: Loaded via `.env.test` for local testing
- Terraform variables: `*.tfvars` files

### Git Workflow

- Main branch: `main`
- CI/CD on every push to `main` (deploys to dev)
- Version tags (`v*.*.*`) trigger production deployment with manual approval
- Semantic release manages versioning automatically

### Code Quality

- Prettier for formatting (`.prettierrc`)
- Lint-staged for pre-commit hooks (`.lintstagedrc`)
- Husky for git hooks (`.husky/`)
- EditorConfig for editor consistency (`.editorconfig`)

## User interface language

The system interface expected to be translated into following languages:

- English (en) - default
- Spanish (es)
- Portuguese (pt)
- Russian (ru)
- Ukrainian (uk)
- Turkish (tr)
- Vietnamese (vi)
- Chinese (zh) - Simplified Chinese (Mainland China)
- Chinese (zh-TW) - Traditional Chinese (Taiwan)

The `Locale` type, the `locales` list and `parseLocale()` live in `packages/model/src/user-metadata.ts`. `zh-TW` is the only hyphenated locale code, so never derive a locale by truncating a language tag to two letters: use `parseLocale()`, which resolves Chinese by script. Traditional tags (`zh-TW`, `zh-HK`, `zh-MO`, `zh-Hant*`) map to `zh-TW`; every other Chinese tag (`zh`, `zh-CN`, `zh-SG`, `zh-Hans*`) maps to `zh`, and an explicit `Hans` script wins over a region (`zh-Hans-TW` is `zh`). In TypeScript records the `zh-TW` key must be quoted (`zh, 'zh-TW': zhTW`) and the files are `zh.ts` / `zh-TW.ts`. Browser extension folders use the underscore form (`_locales/zh_CN`, `_locales/zh_TW`, `cws/zh_CN.txt`, `cws/zh_TW.txt`), Android uses `values-zh` (Simplified) and `values-zh-rTW`, and iOS uses `zh-Hans` and `zh-Hant` in `knownRegions`.

In language pickers each language is labelled with its own name: Simplified Chinese is `简体中文`, Traditional Chinese is `繁體中文`. The `nominative_zh`/`nominative_zh-TW`-style keys are the names of the _learning_ language and keep their "(Simplified)"/"(Traditional)" qualifiers.

Simplified Chinese translations use Mainland terminology and full-width punctuation with “” quotes (e.g. 视频, 网站, 设置, 账号, 单词卡, 扩展程序, 移动应用, 二维码; card collection/deck is 卡组; language names end in 语: 英语, 法语). Traditional Chinese translations use Taiwan terminology (e.g. 影片, 網站, 設定, 帳號, 單字卡, 擴充功能; card collection/deck is 卡片集) and 「」 quotes. Never produce one variant by character conversion of the other alone: the vocabulary differs. Chinese has a single plural form, so mobile translations provide only the `_other` plural keys.

### No emoji

Never use emoji in UI texts, translations, or components. Use icons (e.g. MaterialCommunityIcons via React Native Paper's `Icon`) instead.

### Voice

Vocably is developed by a single person. Never use "we", "us", or "our" (or their equivalents in other languages) in UI texts or translations. Use neutral wording ("This message will appear again…") or, when the author speaks directly, the first person singular ("I", "contact the author").

## Troubleshooting

### Build Issues

```bash
# Rebuild all packages
npx zx ./scripts/build-packages.mjs

# Reset mobile app build
cd mobile-app
npm run reset-ios          # iOS: rm -rf ios/build ios/Pods && pod-install
npm run reset-android      # Android: rm -rf android/.gradle android/build
```

### Dependency Issues

```bash
# Force reinstall all dependencies
rm -rf node_modules package-lock.json
npm ci --force

# Rebuild individual package
cd packages/model && rm -rf dist node_modules && npm install && npm run build
```

### Terraform Issues

```bash
# Re-initialize terraform
cd platform
rm -rf .terraform .terraform.lock.hcl
terraform init
terraform workspace select dev
```
