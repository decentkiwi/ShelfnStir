# Shelf&Stir

A cocktail recipe site built around one question: **what can I make with the bottles I already have?**

Pick the ingredients on your shelf and Shelf&Stir shows which drinks you can make now, which are one or two ingredients away, and which single purchase would unlock the most new recipes.

**Live site:** https://decentkiwi.github.io/ShelfnStir/

## Features

- **Pantry matcher.** Ranks all recipes by how many ingredients you are missing and how hard those are to get (a lime is not the same as a bottle of Chartreuse). Understands equivalents, so bourbon or rye both satisfy "whiskey".
- **Best next buys.** Suggests the single ingredients that would complete the most drinks.
- **43 recipes**, each on its own crawlable page with ingredients, method, batch scaling, smart substitutions, the right glass, background, and variations.
- **Search and filters** by spirit, style, flavor, and effort. Search ignores case and accents.
- **Bar Guide** covering which bottles to buy first and a glassware guide generated from the recipe data.
- **Optional accounts** to sync favorites and your shelf across devices, plus anonymous star ratings and signed-in comments.
- **No tracking.** No analytics, ads, or third-party scripts. Fonts and images are self-hosted.

## How it works

```
Postgres (Neon)  ──►  build.js  ──►  static HTML pages + data files  ──►  GitHub Pages / Cloudflare assets
       ▲
       └───────────  Cloudflare Worker (src/)  ◄──  /api/* requests from the site and the iOS app
```

- **Postgres is the source of truth for recipe content.** `db/schema.sql` defines the schema and `db/migrate.js` applies it and seeds content idempotently.
- **`build.js` is a small static-site generator.** It reads recipes from Postgres and writes one page per recipe (with schema.org `Recipe` structured data), the Bar Guide's glassware section, `data/recipes-data.js`, and `sitemap.xml`.
- **The front end is plain HTML, CSS, and JavaScript** with no framework and no bundler. Matching, search, and filter logic lives in `data/recipe-helpers.js`, which runs unchanged in the browser, in the Worker, and under the test runner.
- **The API is a Cloudflare Worker** (`src/`) that talks to Neon over its HTTP driver. It serves recipes and handles accounts, favorites, shelves, ratings, and comments.

> **Status:** the static site is live on GitHub Pages. The Worker API is complete and tested locally but not yet deployed, so accounts, ratings, and comments are inactive on the live site. The site detects this and runs in guest mode, keeping your shelf and favorites in the browser.

## Project layout

| Path | What it is |
| --- | --- |
| `index.html`, `recipes.html`, `bar-guide.html` | Hand-written pages |
| `recipes/<id>/index.html` | Generated recipe pages (do not edit) |
| `script.js`, `styles.css` | Front-end behavior and styling |
| `data/recipe-helpers.js` | Shared pure logic: matcher, search, filters, derived tags |
| `data/pantry-config.js` | Hand-written matcher configuration: presets, equivalents, cost tiers |
| `data/glassware.js` | Glass descriptions and the per-recipe glass seed |
| `data/recipes-data.js` | Generated from Postgres (do not edit) |
| `db/` | Schema, migration, build-time queries, recipe notes seed |
| `src/` | Cloudflare Worker: routing, auth, rate limiting, API routes |
| `scripts/stage.js` | Copies an allowlist of public files into `.deploy/` |
| `test/` | Unit and data-integrity tests |
| `ios/` | SwiftUI companion app that uses the same API |

## Running it locally

Requirements: Node.js 18 or newer, and a Postgres database (the project uses [Neon](https://neon.tech)).

```bash
npm install
```

Create `.env.local` with your database connection string:

```
DATABASE_URL="postgresql://..."
DATABASE_URL_UNPOOLED="postgresql://..."
```

Then set up the database, build the site, and run the tests:

```bash
npm run migrate   # apply db/schema.sql and seed recipes
npm run build     # regenerate recipe pages, data, and sitemap from Postgres
npm test          # run the test suite
```

The static site works from any file server. To run it together with the API, copy `.dev.vars.example` to `.dev.vars`, fill in the values, then:

```bash
npm run stage
npx wrangler dev
```

Current versions of Wrangler need Node.js 20 or newer.

## Tests

`npm test` runs Node's built-in test runner with no extra dependencies, and GitHub Actions runs it on every push to `main` and on pull requests. The suite covers:

- **Helpers** (`test/helpers.test.js`): ingredient scaling, HTML escaping, derived flavor and effort tags, search, and filters.
- **Matcher** (`test/matcher.test.js`): equivalents, cost ranking, sort order, presets, and next-buy suggestions.
- **Content integrity** (`test/data.test.js`): every recipe has a valid glass, notes, and ingredients that can actually be selected, and no shaken drink is labeled "no shaker".

## Security

- Passwords are hashed with salted PBKDF2-SHA256 through Web Crypto. Sessions are signed JWTs in HttpOnly, SameSite cookies, and each request re-checks that the account still exists.
- All SQL is parameterized. Request bodies are size-capped and validated, and write and sign-in endpoints are rate-limited per IP.
- State-changing requests from other origins are rejected. Private API responses are marked `no-store`.
- A strict Content Security Policy allows only same-origin scripts, styles, and images.
- Publishing uses an allowlist (`scripts/stage.js`), so source, database code, and configuration can never be published to the public site by accident. Secrets live in git-ignored `.env.local` and `.dev.vars` files.
- Accounts can be permanently deleted by their owner, which cascades to their favorites, shelf, and comments.

## Adding or editing a recipe

Recipe content lives in Postgres, so add or change the recipe there with SQL. Give it a glass in `data/glassware.js` and notes in `db/recipe-notes.js`, then:

```bash
npm run build     # pull the new recipe into data/recipes-data.js
npm run migrate   # write its glass and notes into Postgres
npm run build     # regenerate the pages with everything in place
npm test
```

`npm run migrate` re-seeds recipes from `data/recipes-data.js`, so always run `npm run build` first after editing the database directly. Otherwise the migration writes the old values back.

The tests fail if a recipe is missing a glass, missing notes, or requires an ingredient nobody can select.

## Please drink responsibly

Shelf&Stir is intended for adults of legal drinking age. See the site's [responsible drinking](https://decentkiwi.github.io/ShelfnStir/responsible-drinking.html) page.
