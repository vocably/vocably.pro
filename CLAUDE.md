- In all interactions and commit messages, be extremely concise and sacrifice grammar for the sake of concision.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Vocably is a multi-platform language-learning tool that allows users to select words/phrases while reading and learn them through flashcards with spaced repetition. The product includes:

- Browser extensions (Chrome, Safari, iOS Safari, Firefox)
- Mobile apps (iOS & Android via React Native)
- Web application (Angular/Ionic PWA)
- Backend services (AWS Lambda)
- Marketing website

## Development Commands

### Building the Monorepo

```bash
# Build all packages in dependency order
node scripts/build-packages.mjs

# Build specific package
npm --prefix ./packages/<package-name> run build
```

Build order (as defined in `scripts/build-packages.mjs`):

1. `jest` → `sulna` → `node-sulna` → `model` → `model-operations` → `srs` → `webpack` → `crud` → `api` → `lambda-shared` → `analyze`
2. `browser` → `extension-stay-alive` → `extension-messages` → `extension-service-worker` → `extension-content-ui` → `extension-content-script`

### Testing

```bash
# Run all workspace tests
npm run test -ws -- --runInBand

# Test specific package with Jest
npm --prefix ./packages/<package-name> run test

# Test Angular app
npm --prefix ./packages/app run integration

# Test extension content UI (Stencil)
npm --prefix ./packages/extension-content-ui run integration
```

Key packages with tests:

- `backend`: `jest --detectOpenHandles --forceExit`
- `analyze`, `model`, `model-operations`, `srs`, `sulna`, `lambda-shared`: `jest`
- `extension-service-worker`, `extension-content-script`: `jest`

### Running Development Servers

```bash
# Web app
npm --prefix ./packages/app run start        # ng serve on default port

# Extension (watch mode)
npm --prefix ./packages/extension run start  # webpack watch

# Extension popup
npm --prefix ./packages/extension-popup run start

# Extension content UI (Stencil with hot reload)
npm --prefix ./packages/extension-content-ui run extension-content-ui

# Marketing website
npm --prefix ./packages/www run start        # webpack serve with hot reload
```

### Infrastructure & Deployment

```bash
# Deploy mobile apps (from root)
npm run deploy-android
npm run deploy-ios-dev
npm run deploy-ios-prod

# Terraform (from /platform directory)
cd platform
terraform init
terraform workspace select dev|stage|prod
terraform plan -var-file=env-<env>.tfvars
terraform apply -var-file=env-<env>.tfvars
```

Terraform workspaces: `dev`, `stage`, `prod`

## Repository Structure

### Core Shared Libraries (`/packages`)

These libraries are used across backend, frontend, and extensions:

- **`model`**: Core TypeScript types and interfaces (Language, Analysis, Translation, Card, Deck)
- **`analyze`**: Language analysis engine (AI translation, morphology, parts of speech detection)
  - Integrates with Google Cloud Translate, Google Gemini, OpenAI
  - Handles language-specific processing (Japanese, Chinese, Korean, etc.)
- **`model-operations`**: Language-specific transformations and operations on model data
- **`srs`**: Spaced Repetition System implementation (learning algorithm)
- **`crud`**: Generic CRUD wrapper for DynamoDB operations
- **`api`**: REST API client and endpoint type definitions
- **`lambda-shared`**: Shared utilities for AWS Lambda functions
- **`sulna`/`node-sulna`**: Text segmentation/tokenization libraries

### Frontend Applications

- **`app`**: Angular 14 + Ionic 6 web application (PWA)
  - Main user interface for managing cards and decks
  - Located at packages/app/src/app/
- **`www`**: Marketing website (Webpack + Handlebars templates)
- **`extension-popup`**: Angular-based extension popup UI
- **`extension-content-ui`**: Stencil web components injected into web pages
- **`extension-content-script`**: Content script for DOM interaction and word selection
- **`extension-service-worker`**: Background service worker (API calls, state management)
- **`extension-messages`**: Message passing protocol between extension components
- **`extension-stay-alive`**: Keep-alive mechanism for extension
- **`extension`**: Main Chrome extension build output
- **`safari-extension`**: Safari-specific extension build
- **`ios-extension`**: Safari extension for iOS

### Backend Services (`/packages`)

- **`backend`**: AWS Lambda functions (in `src/lambdas/`)
  - `analyze`: Main word/phrase analysis
  - `analyze-units-of-speech`: Detailed grammatical analysis
  - `generate-units-of-speech`: Generate inflection examples
  - `bulk-analyze`: Batch processing
  - `explain`: AI-powered sentence explanations
  - `chat-with-card`: Conversational learning
  - `generate-mnemonic`: Memory aid generation
  - `play-sound`: Text-to-speech
  - `onboard`: User onboarding
  - Card management (get/list/add/update/delete)
  - Notification management
- **`auth-lambdas`**: AWS Cognito authentication lifecycle hooks
- **`www-backend`**: Website backend (Paddle & RevenueCat payment webhooks)
- **`public-backend`**: Public-facing API utilities

### Infrastructure

- **`/platform`**: Terraform IaC for AWS resources
  - API Gateway, Lambda, DynamoDB, Cognito, S3, SES, Pinpoint
  - Build artifacts: `backend_build.zip`, `auth_lambdas_build.zip`, `www_backend_build.zip`, `public_backend_build.zip`
- **`/platform-root`**: Root Terraform configuration

### Mobile

- **`/mobile-app`**: React Native application for iOS and Android
  - Uses React Native, AWS Amplify for auth
  - Fastlane for deployment automation

### Other Directories

- **`/dashboard`**: Administrative scripts and tools
- **`/batch-analyze`**: Batch processing utilities
- **`/sync-server`**: Data synchronization server
- **`/scripts`**: Build, deployment, and helper scripts

## Architecture Patterns

### Extension Architecture (Message-Driven)

1. Content script detects text selection on webpage
2. Sends message to service worker via `extension-messages` protocol
3. Service worker makes API call to Lambda backend
4. Lambda uses `analyze` package to process the text
5. Results stored in DynamoDB via `crud` package
6. Service worker notifies popup UI to update
7. Mobile app syncs cards from backend

### Backend Data Flow

```
User action (select word)
  ↓
Extension service worker
  ↓
AWS API Gateway
  ↓
Lambda function (backend/src/lambdas/analyze)
  ↓
@vocably/analyze package
  ↓
External APIs (Google Cloud Translate/Gemini, OpenAI)
  ↓
DynamoDB (via @vocably/crud)
  ↓
Return Analysis result
```

### Authentication Flow

- AWS Cognito manages user authentication
- Auth lifecycle hooks in `auth-lambdas` (post-confirmation)
- Cognito tokens passed to clients (web/mobile/extension)
- API Gateway validates tokens against Cognito user pool
- User metadata stored in DynamoDB

### Technology Stack Summary

- **Frontend**: Angular 14, React Native, Ionic 6, Stencil, RxJS 7
- **Backend**: AWS Lambda (Node.js 20), API Gateway, DynamoDB, S3, Cognito
- **Infrastructure**: Terraform
- **AI/NLP**: Google Cloud (Text-to-Speech, Translate), Google Gemini, OpenAI
- **Build Tools**: Webpack 5, TypeScript 4.7, Jest 29
- **Payments**: Paddle, RevenueCat
- **Analytics**: Sentry, PostHog

## Working with Lambda Functions

Lambda functions are built via Webpack and deployed through Terraform's `data.external` resources.

To modify a Lambda function:

1. Edit code in `packages/backend/src/lambdas/<function-name>/`
2. Build: `npm --prefix ./packages/backend run build`
3. Terraform will detect changes and redeploy

Lambda functions use RxJS for async operations and return results via observables.

## Dual TypeScript Compilation

Several packages compile to both ESM and CommonJS:

- `sulna`, `node-sulna`, `srs`, `webpack`
- Uses two tsconfig files: `tsconfig.json` (ESM) and `tsconfig.commonjs.json`
- Build script runs: `tsc && tsc --project tsconfig.commonjs.json`

## Extension Development Notes

- Extension manifest version 3 (service worker, not background page)
- Content script injected into web pages cannot directly access extension APIs
- Communication via message passing through `extension-messages` package
- Service worker coordinates all background operations
- Content UI uses Stencil web components for shadow DOM isolation

## Code Conventions

- TypeScript strict mode enabled
- Prettier for formatting (config in `.prettierrc`)
- Husky + lint-staged for pre-commit hooks
- Semantic release for automated versioning
- No tests for some packages (indicated by `echo` in package.json test script)

## Language Support

Vocably supports multiple languages with specialized processing:

- Japanese: Uses `tiny-segmenter` for tokenization, `wanakana` for romanization
- Chinese: Character-based segmentation
- Korean: Specialized morphological analysis
- European languages: Standard tokenization

Language-specific logic is in `packages/analyze` and `packages/model-operations`.
