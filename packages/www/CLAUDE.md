# packages/www

## Page styles

- Do NOT add new SCSS files to `src/styles/sections/` for page-specific styles.
- Put page styles in a `<style>` block inside the page's handlebars template (`src/pages/*.handlebars`), right after the `{{#> layout ...}}` opening.
- Styles shared by several pages go into a partial in `src/partials/` (e.g. `ise-styles.handlebars`) and are included with `{{> partial-name }}`.
- Use the CSS variables declared on `:root` in `src/styles/_global.scss` (sourced from `@vocably/styles/_variables.scss`) instead of SASS variables, e.g. `var(--v-color-primary)`, `rgba(var(--v-color-primary-rgb), 0.1)`, `var(--v-headings-font-family)`. Add a new variable there if one is missing.
- Bootstrap mixins aren't available in `<style>` blocks; use plain media queries (`sm` = 576px, `md` = 768px, `lg` = 992px).
