# Yixuan Even Xu's Academic Website

Source for [yixuanevenxu.github.io](https://yixuanevenxu.github.io), built with Jekyll and the gem-based al-folio v1.2 architecture.

## Local Development

The site requires Ruby, Bundler, and ImageMagick.

```bash
bundle install
bundle exec jekyll serve --host 0.0.0.0 --port 8080
```

Open `http://localhost:8080/`. When the server runs on a remote machine, forward the port from a Mac with:

```bash
ssh -N -L 8080:127.0.0.1:8080 USER@SERVER
```

## Verification

```bash
JEKYLL_ENV=production bundle exec jekyll build --trace
bundle exec al-folio upgrade audit
npm ci
npx playwright install chromium
npm run test:visual
```

The Playwright suite checks the homepage and publications page on desktop and mobile, including responsive overflow, direct CV navigation, venue badge sizing, and dark-mode behavior.

## Deployment

Pushes to `master` automatically build and deploy the site to `gh-pages`. `bin/deploy` remains available as a manual fallback.

Site-specific template and Sass overrides are tracked in `.al-folio-overrides.yml`; review them with `bundle exec al-folio upgrade overrides audit` when updating al-folio gems.
