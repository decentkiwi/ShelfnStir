// Generates a static, crawlable page for every recipe (recipes/<id>/index.html),
// plus sitemap.xml and robots.txt. Run with: node build.js
// Re-run any time data/recipes-data.js changes.

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const { loadEnvLocal } = require("./db/env.js");
const { fetchRecipeBlueprints, fetchIngredientGroups } = require("./db/fetch-recipes.js");
const { buildRecipes, escapeHtml } = require("./data/recipe-helpers.js");

loadEnvLocal();

const ROOT = __dirname;
const BASE_URL = "https://decentkiwi.github.io/ShelfnStir/";
const BUILD_DATE = new Date().toISOString().slice(0, 10);

let recipes;

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
  return JSON.stringify(jsonLd);
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
    <link rel="stylesheet" href="../../styles.css?v=20260829-mobile-polish" />
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
              <div id="dialog-substitutions" class="substitution-box">
                ${
                  recipe.substitutions.length
                    ? `<h4>Smart swaps</h4>${recipe.substitutions
                        .map((swap) => `<p><strong>${escapeHtml(swap.ingredient)}:</strong> ${escapeHtml(swap.note)}</p>`)
                        .join("")}`
                    : ""
                }
              </div>
            </div>
            <div>
              <h3>Method</h3>
              <ol id="dialog-method">
                ${recipe.method.map((step) => `<li>${escapeHtml(step)}</li>`).join("\n                ")}
              </ol>
            </div>
          </div>
        </div>
      </article>

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
      </div>
      <nav aria-label="Footer navigation">
        <a href="../../privacy.html">Privacy</a>
        <a href="../../responsible-drinking.html">Responsible drinking</a>
        <a href="../../bar-guide.html">Bar Guide</a>
      </nav>
    </footer>

    <script src="../../data/recipes-data.js?v=20260829"></script>
    <script src="../../data/pantry-config.js?v=20260829"></script>
    <script src="../../data/recipe-helpers.js?v=20260829"></script>
    <script src="../../script.js?v=20260829-better-card-tags"></script>
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
  const staticPages = ["", "recipes.html", "bar-guide.html", "privacy.html", "responsible-drinking.html"];
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

  const client = new Client({ connectionString });
  await client.connect();

  let recipeBlueprints;
  let ingredientGroups;
  try {
    recipeBlueprints = await fetchRecipeBlueprints(client);
    ingredientGroups = await fetchIngredientGroups(client);
  } finally {
    await client.end();
  }

  writeGeneratedRecipesData(recipeBlueprints, ingredientGroups);
  recipes = buildRecipes(recipeBlueprints);

  writeRecipePages();
  writeSitemap();
  writeRobots();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
