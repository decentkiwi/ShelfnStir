// Generates a static, crawlable page for every recipe (recipes/<id>/index.html),
// plus sitemap.xml and robots.txt. Run with: node build.js
// Re-run any time data/recipes-data.js changes.

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const { loadEnvLocal } = require("./db/env.js");
const { fetchRecipeBlueprints, fetchIngredientGroups, fetchRatingSummaries } = require("./db/fetch-recipes.js");
const { buildRecipes, escapeHtml } = require("./data/recipe-helpers.js");
const { glassTypes, glassByKey } = require("./data/glassware.js");

loadEnvLocal();

const ROOT = __dirname;
const BASE_URL = "https://decentkiwi.github.io/ShelfnStir/";
const BUILD_DATE = new Date().toISOString().slice(0, 10);

let recipes;
let ratingSummaries = new Map();

function writeGeneratedRecipesData(recipeBlueprints, ingredientGroups) {
  const contents = `// GENERATED FILE -- do not edit by hand.
// Source of truth is Postgres (see db/schema.sql). To change recipe content,
// update the database (e.g. via db/migrate.js or direct SQL), then re-run
// \`npm run build\` to regenerate this file.
(function (root, factory) {
  const data = factory();
  if (typeof module === "object" && module.exports) {
    module.exports = data;
  } else {
    root.ShelfStirData = data;
  }
})(typeof self !== "undefined" ? self : this, function () {
  const recipeBlueprints = ${JSON.stringify(recipeBlueprints, null, 2)};
  const ingredientGroups = ${JSON.stringify(ingredientGroups, null, 2)};
  return { recipeBlueprints, ingredientGroups };
});
`;
  fs.writeFileSync(path.join(ROOT, "data", "recipes-data.js"), contents);
  console.log("Regenerated data/recipes-data.js from Postgres");
}

function timeToIsoDuration(time) {
  const minutes = Number.parseInt(time, 10);
  return Number.isFinite(minutes) ? `PT${minutes}M` : undefined;
}

function relatedRecipes(recipe, count = 4) {
  const scored = recipes
    .filter((candidate) => candidate.id !== recipe.id)
    .map((candidate) => {
      const sharedTags = candidate.tags.filter((tag) => recipe.tags.includes(tag)).length;
      return { candidate, sharedTags };
    })
    .filter((entry) => entry.sharedTags > 0)
    .sort((a, b) => b.sharedTags - a.sharedTags || a.candidate.name.localeCompare(b.candidate.name));
  return scored.slice(0, count).map((entry) => entry.candidate);
}

// Raw egg white is a food-safety issue worth flagging on the recipe itself.
function eggNoteHtml(recipe) {
  if (!recipe.ingredients.some((ingredient) => /\begg\b/i.test(ingredient))) return "";
  return `<p class="safety-note"><strong>Contains raw egg white.</strong> Use fresh, pasteurized eggs, and skip it if you're pregnant, elderly, very young, or immunocompromised.</p>`;
}

function glassIconSvg(glass) {
  return `<svg class="glass-icon" viewBox="0 0 64 64" width="56" height="56" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${glass.icon}</svg>`;
}

// "Serve it in" note on each recipe page: the glass, why it matters, and a
// link into the Bar Guide's glassware section.
function glassNoteHtml(recipe) {
  const glass = glassByKey[recipe.glass];
  if (!glass) return "";
  return `<aside class="glass-note" aria-label="Recommended glass">
                ${glassIconSvg(glass)}
                <div>
                  <p class="eyebrow">Serve it in</p>
                  <h4>${escapeHtml(glass.name)}</h4>
                  <p>${escapeHtml(glass.why)}</p>
                  <a href="../../bar-guide.html#glass-${glass.key}">More about glassware</a>
                </div>
              </aside>`;
}

function glassGuideHtml() {
  const byGlass = new Map(glassTypes.map((glass) => [glass.key, []]));
  recipes.forEach((recipe) => byGlass.get(recipe.glass)?.push(recipe));
  const ranked = [...glassTypes].sort((a, b) => byGlass.get(b.key).length - byGlass.get(a.key).length);
  const trio = ranked.slice(0, 3);
  const covered = trio.reduce((sum, glass) => sum + byGlass.get(glass.key).length, 0);
  const names = trio.map((glass) => glass.name.toLowerCase());

  const cards = glassTypes
    .map((glass) => {
      const drinks = byGlass.get(glass.key);
      const links = drinks.map((r) => `<a href="recipes/${r.id}/">${escapeHtml(r.name)}</a>`).join(", ");
      return `
          <article class="glass-card" id="glass-${glass.key}">
            <div class="glass-card-head">
              ${glassIconSvg(glass)}
              <div>
                <h3>${escapeHtml(glass.name)}</h3>
                <p class="glass-meta">${escapeHtml(glass.size)} &middot; ${escapeHtml(glass.shape)}</p>
              </div>
            </div>
            <p class="glass-serves"><strong>Best for:</strong> ${escapeHtml(glass.serves)}.</p>
            <p>${escapeHtml(glass.why)}</p>
            <p class="glass-tip"><strong>Tip:</strong> ${escapeHtml(glass.tip)}</p>
            ${drinks.length ? `<p class="glass-drinks"><strong>${drinks.length} drink${drinks.length === 1 ? "" : "s"} here:</strong> ${links}</p>` : ""}
          </article>`;
    })
    .join("");

  return `<section class="guide-section" id="glassware" aria-labelledby="glass-title">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Glassware</p>
            <h2 id="glass-title">The right glass changes how a cocktail looks and tastes</h2>
          </div>
        </div>
        <p class="glass-intro">
          Glass shape controls temperature, carbonation, ice, and how much aroma reaches your nose, so it
          shapes the drink as much as the recipe does. You don't need a full set. Start with a ${names[0]},
          a ${names[1]}, and a ${names[2]}, which together serve ${covered} of our ${recipes.length} recipes.
        </p>
        <div class="glass-basics">
          <div><h3>Chill what's served up</h3><p>Fill the glass with ice and water while you mix, or keep coupes in the freezer. A cold glass holds the drink at the temperature you shook it to.</p></div>
          <div><h3>Match the pour to the glass</h3><p>A drink that fills about three-quarters of the glass looks right and carries without spilling. A small pour in a huge glass warms up fast.</p></div>
          <div><h3>Rinse well</h3><p>Soap film flattens bubbles and collapses the foam on egg-white drinks. Rinse thoroughly and let glasses air dry.</p></div>
        </div>
        <div class="glass-grid">${cards}
        </div>
      </section>`;
}

function writeBarGuideGlassware() {
  const file = path.join(ROOT, "bar-guide.html");
  const html = fs.readFileSync(file, "utf8");
  const pattern = /<!-- glassware:start[^>]*-->[\s\S]*?<!-- glassware:end -->/;
  if (!pattern.test(html)) throw new Error("bar-guide.html is missing the glassware:start/end markers");
  const block = `<!-- glassware:start (generated by build.js from data/glassware.js; do not edit by hand) -->\n      ${glassGuideHtml()}\n      <!-- glassware:end -->`;
  fs.writeFileSync(file, html.replace(pattern, () => block));
  console.log("Updated glassware section in bar-guide.html");
}

function recipeCardHtml(recipe) {
  return `
    <article class="recipe-card">
      <div class="recipe-card-content">
        <div class="tag-row"><span class="tag">${escapeHtml(recipe.type)}</span></div>
        <h3><a href="../${recipe.id}/">${escapeHtml(recipe.name)}</a></h3>
        <p>${escapeHtml(recipe.summary)}</p>
        <div class="spec">
          <span>${escapeHtml(recipe.type)}</span>
          <span>${escapeHtml(recipe.time)}</span>
          <span>${escapeHtml(recipe.strength)}</span>
          ${recipe.glass ? `<span>${escapeHtml(glassByKey[recipe.glass].name)}</span>` : ""}
        </div>
        <div class="card-actions">
          <a href="../${recipe.id}/">View recipe</a>
        </div>
      </div>
    </article>
  `;
}

function recipeJsonLd(recipe) {
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Recipe",
    name: recipe.name,
    description: recipe.summary,
    image: [`${BASE_URL}${recipe.image}`],
    author: { "@type": "Organization", name: "Shelf&Stir" },
    datePublished: BUILD_DATE,
    recipeCategory: recipe.type,
    recipeCuisine: "Cocktail",
    keywords: [...recipe.tags, ...recipe.flavorTags].join(", "),
    totalTime: timeToIsoDuration(recipe.time),
    recipeYield: "1 cocktail",
    recipeIngredient: recipe.ingredients,
    recipeInstructions: recipe.method.map((step) => ({ "@type": "HowToStep", text: step })),
  };

  // Only emitted once real ratings exist (Google needs ratingCount >= 1), and
  // the same numbers are rendered visibly on the page as required.
  const summary = ratingSummaries.get(recipe.id);
  if (summary) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: summary.average,
      ratingCount: summary.count,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // Escape "<" so recipe text can never close the surrounding <script> tag.
  return JSON.stringify(jsonLd).replace(/</g, "\\u003c");
}

function ratingSummaryText({ average, count }) {
  return `${average.toFixed(1)} out of 5 from ${count} rating${count === 1 ? "" : "s"}`;
}

function communityHtml(recipe) {
  const summary = ratingSummaries.get(recipe.id);
  const stars = [1, 2, 3, 4, 5]
    .map((n) => `<button type="button" class="star" data-rating="${n}" aria-label="Rate ${n} out of 5" aria-pressed="false">&#9733;</button>`)
    .join("\n              ");

  // Ratings/comments are interactive only where the API exists; the section
  // stays hidden until script.js confirms that, unless there's a saved rating
  // summary worth showing to everyone (including crawlers).
  return `<section class="community" id="community"${summary ? "" : " hidden"} aria-label="Ratings and comments">
        <div class="community-inner">
          <p class="rating-summary" id="rating-summary">${summary ? escapeHtml(ratingSummaryText(summary)) : ""}</p>
          <div class="rating-input" id="rating-input" hidden>
            <h3>Rate this drink</h3>
            <div class="rating-stars" role="group" aria-label="Rate this drink from 1 to 5 stars">
              ${stars}
            </div>
            <p class="rating-status" id="rating-status" aria-live="polite"></p>
          </div>
          <div class="comments" id="comments" hidden>
            <h3>Comments</h3>
            <div id="comment-form-slot"></div>
            <ul class="comment-list" id="comment-list"></ul>
          </div>
        </div>
      </section>`;
}

function recipePageHtml(recipe) {
  const related = relatedRecipes(recipe);
  const title = `${recipe.name} Recipe | Shelf&Stir`;
  const description = `${recipe.summary} Full ingredients, method, and smart substitutions for the ${recipe.name}.`;
  const canonical = `${BASE_URL}recipes/${recipe.id}/`;
  const ogImage = `${BASE_URL}${recipe.image}`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; img-src 'self'; script-src 'self'; style-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'" />
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeHtml(recipe.name)} | Shelf&amp;Stir" />
    <meta property="og:description" content="${escapeHtml(recipe.summary)}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:url" content="${canonical}" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="icon" href="../../assets/favicon.png" />
    <link rel="stylesheet" href="../../styles.css?v=20261006-glassware" />
    <script type="application/ld+json">${recipeJsonLd(recipe)}</script>
  </head>
  <body data-recipe-id="${recipe.id}">
    <header class="site-header">
      <a class="brand" href="../../index.html" aria-label="Shelf and Stir home">
        <span class="brand-mark">S</span>
        <span>Shelf&Stir</span>
      </a>
      <nav aria-label="Primary navigation">
        <a href="../../index.html#pantry">What Can I Make?</a>
        <a href="../../recipes.html">Recipes</a>
        <a href="../../bar-guide.html">Bar Guide</a>
      </nav>
    </header>

    <main id="top">
      <nav class="breadcrumbs" aria-label="Breadcrumb">
        <a href="../../index.html">Home</a>
        <span aria-hidden="true">/</span>
        <a href="../../recipes.html">Recipes</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">${escapeHtml(recipe.name)}</span>
      </nav>

      <article class="recipe-detail">
        <div class="dialog-body">
          <p class="eyebrow">${escapeHtml(recipe.type)}</p>
          <h1>${escapeHtml(recipe.name)}</h1>
          <p id="dialog-summary">${escapeHtml(recipe.summary)}</p>
          <div class="scan-row">
            <span>${escapeHtml(recipe.type)}</span>
            <span>${escapeHtml(recipe.time)}</span>
            <span>${escapeHtml(recipe.strength)}</span>
            ${recipe.glass ? `<span>${escapeHtml(glassByKey[recipe.glass].name)}</span>` : ""}
          </div>

          <div class="dialog-tools">
            <button type="button" id="dialog-favorite">Save favorite</button>
            <div class="batch-control" aria-label="Batch size">
              <span>Batch</span>
              <button type="button" data-batch="1" class="active">1</button>
              <button type="button" data-batch="2">2</button>
              <button type="button" data-batch="4">4</button>
              <button type="button" data-batch="8">8</button>
            </div>
          </div>

          <div class="dialog-columns">
            <div>
              <h3>Ingredients</h3>
              <ul id="dialog-ingredients">
                ${recipe.ingredients.map((ingredient) => `<li>${escapeHtml(ingredient)}</li>`).join("\n                ")}
              </ul>
              ${
                recipe.substitutions.length
                  ? `<div id="dialog-substitutions" class="substitution-box">
                <h4>Smart swaps</h4>${recipe.substitutions
                  .map((swap) => `<p><strong>${escapeHtml(swap.ingredient)}:</strong> ${escapeHtml(swap.note)}</p>`)
                  .join("")}
              </div>`
                  : ""
              }
              ${eggNoteHtml(recipe)}
            </div>
            <div>
              <h3>Method</h3>
              <ol id="dialog-method">
                ${recipe.method.map((step) => `<li>${escapeHtml(step)}</li>`).join("\n                ")}
              </ol>
              ${glassNoteHtml(recipe)}
            </div>
          </div>
        </div>
      </article>

      ${communityHtml(recipe)}

      ${
        related.length
          ? `<section class="pathways" aria-labelledby="related-title">
        <div class="section-heading">
          <div>
            <p class="eyebrow">Keep pouring</p>
            <h2 id="related-title">Cocktails in the same vein as the ${escapeHtml(recipe.name)}</h2>
          </div>
        </div>
        <div class="recipe-grid">
          ${related.map(recipeCardHtml).join("\n          ")}
        </div>
      </section>`
          : ""
      }
    </main>

    <footer class="site-footer">
      <div>
        <strong>Shelf&Stir</strong>
        <p>Find cocktails from what you already have at home.</p>
        <p class="footer-note">For adults of legal drinking age. Please drink responsibly.</p>
      </div>
      <nav aria-label="Footer navigation">
        <a href="../../recipes.html">Recipes</a>
        <a href="../../bar-guide.html">Bar Guide</a>
        <a href="../../privacy.html">Privacy</a>
        <a href="../../terms.html">Terms</a>
        <a href="../../responsible-drinking.html">Responsible drinking</a>
      </nav>
    </footer>

    <script src="../../data/recipes-data.js?v=20261006"></script>
    <script src="../../data/pantry-config.js?v=20260829"></script>
    <script src="../../data/glassware.js?v=20261006"></script>
    <script src="../../data/recipe-helpers.js?v=20260829"></script>
    <script src="../../script.js?v=20261006-glassware"></script>
  </body>
</html>
`;
}

function writeRecipePages() {
  const recipesDir = path.join(ROOT, "recipes");
  fs.mkdirSync(recipesDir, { recursive: true });
  recipes.forEach((recipe) => {
    const dir = path.join(recipesDir, recipe.id);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "index.html"), recipePageHtml(recipe));
  });
  console.log(`Wrote ${recipes.length} recipe pages to /recipes/<id>/`);
}

function writeSitemap() {
  const staticPages = ["", "recipes.html", "bar-guide.html", "privacy.html", "terms.html", "responsible-drinking.html"];
  const urls = [
    ...staticPages.map((page) => `${BASE_URL}${page}`),
    ...recipes.map((recipe) => `${BASE_URL}recipes/${recipe.id}/`),
  ];
  const body = urls
    .map((url) => `  <url>\n    <loc>${url}</loc>\n    <lastmod>${BUILD_DATE}</lastmod>\n  </url>`)
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), xml);
  console.log(`Wrote sitemap.xml with ${urls.length} URLs`);
}

function writeRobots() {
  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${BASE_URL}sitemap.xml\n`;
  fs.writeFileSync(path.join(ROOT, "robots.txt"), robots);
  console.log("Wrote robots.txt");
}

async function main() {
  const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Missing DATABASE_URL(_UNPOOLED) - run `neon link` first or check .env.local");
  }

  const client = new Client({ connectionString, connectionTimeoutMillis: 15000 });
  await client.connect();

  let recipeBlueprints;
  let ingredientGroups;
  try {
    recipeBlueprints = await fetchRecipeBlueprints(client);
    ingredientGroups = await fetchIngredientGroups(client);
    ratingSummaries = await fetchRatingSummaries(client);
  } finally {
    await client.end();
  }

  writeGeneratedRecipesData(recipeBlueprints, ingredientGroups);
  recipes = buildRecipes(recipeBlueprints);

  writeRecipePages();
  writeBarGuideGlassware();
  writeSitemap();
  writeRobots();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
