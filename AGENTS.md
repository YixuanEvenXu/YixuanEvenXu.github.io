# Repository Guide

This is Yixuan Even Xu's personal academic website. It is based on al-folio v1.2 and uses Jekyll with the gem-based `al_folio_core` runtime.

## Architecture

- Site content lives in `_pages`, `_posts`, `_news`, `_bibliography`, `_data`, and `assets`.
- Runtime layouts, includes, Sass, and JavaScript normally come from the versioned al-folio gems in `Gemfile`.
- The local `_includes` and `_sass` files are intentional site-specific overrides. Keep them narrow and record reviewed changes with `bundle exec al-folio upgrade overrides accept <path>`.
- The production site is rooted at `/`; do not introduce the upstream demo baseurl `/al-folio`.
- CV and Distill feature plugins are disabled. The CV navigation item links directly to `assets/pdf/CV.pdf`.

## Commands

```bash
bundle install
bundle exec jekyll serve --host 0.0.0.0 --port 8080
JEKYLL_ENV=production bundle exec jekyll build --trace
bundle exec al-folio upgrade audit
npm ci
npx playwright install chromium
npm run test:visual
```

Pushes to `master` build and deploy `_site` to `gh-pages` through `.github/workflows/deploy.yml`. `bin/deploy` is retained as a manual fallback.
