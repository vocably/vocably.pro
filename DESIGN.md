# Vocably UI/UX Design Document

## Overview

Vocably surfaces UI across five distinct platforms, all sharing a common design language: a primary blue color system, Material Design influences, CSS variable–based theming, and 8-language localization.

---

## Platforms

| Platform             | Framework            | UI Library               | Entry Point                     |
| -------------------- | -------------------- | ------------------------ | ------------------------------- |
| Extension Popup      | Angular 19           | Angular Material         | `packages/extension-popup`      |
| Extension Content UI | StencilJS            | Custom SCSS + Shadow DOM | `packages/extension-content-ui` |
| Web Dashboard        | Angular 19           | Angular Material         | `packages/app`                  |
| Mobile App           | React Native 0.77    | React Native Paper (MD3) | `mobile-app`                    |
| Marketing Website    | Handlebars + Webpack | Custom SCSS              | `packages/www`                  |

---

## Design System

### Colors

Defined in `packages/styles/_colors.scss` as 10-step scales (50–950).

| Scale                | Usage                                                 |
| -------------------- | ----------------------------------------------------- |
| **Primary Blue**     | Brand, CTAs, links (`#0050ff` light / `#28a5ff` dark) |
| **Gray**             | Backgrounds, borders, muted text                      |
| **Green**            | Success states, correct answers                       |
| **Red**              | Danger, errors, wrong answers                         |
| **Orange**           | Warnings                                              |
| **Secondary Yellow** | Highlights, accents                                   |

### Theming

Themes are applied via a SCSS mixin (`@mixin theme-variables`) that emits CSS custom properties at `:root`. Switching theme = swapping the variable set.

| Token         | Light                | Dark              |
| ------------- | -------------------- | ----------------- |
| `--primary`   | `#0050ff`            | `#28a5ff`         |
| `--body-bg`   | `rgb(255, 255, 255)` | `rgb(37, 37, 37)` |
| `--body-text` | `#6a6a6a`            | `#bababa`         |
| `--danger`    | `#ff5e5e`            | `#ff5e5e`         |

The mobile app mirrors this via React Native Paper's MD3 theme object (`AppTheme`), with extensions for `inputBg`, `inputBgFocused`, and `primaryVariant`.

### Typography

- The system uses the Roboto font stack
- Extension Content UI: system font stack, base `font-size: 100%`
- Icons: Material Symbols (web/extension), Material Community Icons (mobile)

---

## Platform Screens & Flows

### 1. Extension Popup

A compact Angular app embedded in the browser extension popup.

**Screens:**

- **Home** — language pair picker, search input, translation result, card save action
- **Settings** — locale selector, language pair management, account info

**Content UI (StencilJS, injected into the page):**

- Floating overlay triggered by text selection
- Components: `<search-form>`, `<translation-cards>`, `<card-definitions>`, `<tags-menu>`, `<grammar-fixer>`, `<sign-in>`
- Uses Shadow DOM to isolate styles from host page CSS

**Primary flow:**

```
Select word on page
  → Content UI overlay appears
  → Translation result displayed
  → User saves card to deck
  → (Optional) Add tags, hear pronunciation
```

---

### 2. Web Dashboard

Full-page Angular SPA at `app.vocably.pro`. Route-based lazy-loaded modules.

**Screens:**

- **Auth** — Sign in, auto sign-in, sign-out confirmation
- **Welcome / Onboarding** — two-step flow: language selection → how-to guide (videos, highlight instructions)
- **Dashboard** — deck list with study stats and streak
- **Study** — SRS flashcard session (see Study System below)
- **Deck Edit** — card CRUD, bulk import
- **Deck Export** — export to Anki/CSV
- **Settings** — study preferences, study step configuration, locale
- **Subscription / Membership** — pricing tiers, Paddle checkout
- **Tags** — tag management across decks
- **Static pages** — About, Feedback, Not Found

**Primary flow:**

```
Sign in
  → Onboarding (first visit)
  → Dashboard (deck list)
  → Select deck → Study session
  → Grade cards → View streak/progress
```

---

### 3. Mobile App

React Native app (iOS & Android). Uses React Navigation with Stack + Tab + Drawer navigators.

**Screens:**

- **Welcome / Onboarding** — multi-slide intro: SelectToTranslate, LookUp, Card, ReverseTranslate, DesktopBrowser, SelectLanguage
- **Dashboard** — card list with swipe-to-delete, tag filter, language selector, streak, study button
- **Look Up** — inline word lookup with translation + card creation modal
- **Study** — SRS session (see Study System below)
- **Settings**
  - Main settings
  - Study settings (mode toggles: flip, multiple choice, arrange letters)
  - Study step preview modal
  - Premium features
  - Subscription management
- **Chat with Card** — AI conversation about a specific card
- **Language / Deck management** — language pair selection, deck switching

**Share Extension flow (iOS & Android):**

```
User shares text from any app
  → Vocably share extension opens
  → Card created inline
  → Returns to source app
```

---

### 4. Marketing Website

Static Handlebars site. Pages: Home, Pricing, App download, Grammar feature, SRS explainer, Anki integration, About, Privacy, Terms, Blog-style content pages.

---

## Study System (SRS)

Shared across dashboard and mobile. The spaced-repetition engine lives in `@vocably/srs`.

### Card Exercise Types

| Type                   | Description                                          |
| ---------------------- | ---------------------------------------------------- |
| **Flip card**          | Show front → user recalls → reveal back              |
| **Multiple choice**    | Show term → pick correct translation from 4 options  |
| **Sentence fill (AB)** | Fill in the blank                                    |
| **Arrange by letters** | Reconstruct the word from scrambled letters (mobile) |
| **Reverse**            | Target language → source language                    |

### Grading

Cards are graded 1–5 after each review. The SRS algorithm schedules the next review date based on the grade. The grade UI varies by platform:

- **Web**: Star/button row
- **Mobile**: Swipe gesture (`SwipeGrade`) or tap buttons

### Session Completion

A completion screen is shown after all due cards are reviewed, displaying session stats and encouraging streak continuation.

---

## Localization

All UI surfaces support 8 languages: `en` (default), `es`, `pt`, `ru`, `uk`, `tr`, `vi`.

| Platform             | Implementation                                                                        |
| -------------------- | ------------------------------------------------------------------------------------- |
| Web Dashboard        | Transloco — lazy-loaded JSON locale files                                             |
| Extension Popup      | Custom `TranslationService` + `TranslatePipe`                                         |
| Extension Content UI | Window-based `t()` / `setLocale()` system (`packages/extension-content-ui/src/i18n/`) |
| Mobile               | Device locale detection + settings override                                           |
| Website              | Build-time multi-language static generation                                           |

The active locale is persisted in `ExtensionSettings.locale` (Chrome sync storage) and propagated to both Angular and StencilJS layers on startup.

---

## Shared UX Patterns

### Empty States

Every list view (no decks, no cards, no study due) has a dedicated empty-state screen with a call to action.

### Loading

Animated loaders used consistently across content UI and dashboard while API calls are in flight.

### Error Handling

Snackbar notifications (dashboard/extension) and inline error messages for failed API calls, auth errors, and validation.

### Streak

Study streak is displayed on both dashboard and mobile home screen as a motivational indicator. Streak logic lives server-side; the UI reads from user metadata context.

### Subscription Gates

Premium features are gated behind a subscription check. Upsell surfaces appear inline (e.g., in settings, on study completion) and route to the Subscription screen (web: Paddle, mobile: RevenueCat).
