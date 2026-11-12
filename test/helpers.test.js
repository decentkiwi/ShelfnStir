const test = require("node:test");
const assert = require("node:assert/strict");

const h = require("../data/recipe-helpers.js");

function recipe(overrides = {}) {
  const base = {
    id: "test",
    name: "Test Drink",
    type: "Sour",
    tags: [],
    time: "5 min",
    strength: "Bright",
    summary: "A test drink.",
    ingredients: ["2 oz gin", "3/4 oz lemon juice", "3/4 oz simple syrup"],
    required: ["gin", "lemon juice", "simple syrup"],
    method: ["Stir with ice.", "Strain."],
  };
  const merged = { ...base, ...overrides };
  merged.flavorTags = h.recipeFlavorTags(merged);
  merged.effortTags = h.recipeEffortTags(merged);
  return merged;
}

test("scaleIngredient multiplies the leading amount and leaves the rest alone", () => {
  assert.equal(h.scaleIngredient("2 oz gin", 1), "2 oz gin");
  assert.equal(h.scaleIngredient("2 oz gin", 4), "8 oz gin");
  assert.equal(h.scaleIngredient("3/4 oz lime juice", 2), "1 1/2 oz lime juice");
  assert.equal(h.scaleIngredient("1 1/2 oz Campari", 2), "3 oz Campari");
  assert.equal(h.scaleIngredient("Orange peel", 8), "Orange peel");
});

test("formatAmount writes quarters as fractions", () => {
  assert.equal(h.formatAmount(0.75), "3/4");
  assert.equal(h.formatAmount(1.5), "1 1/2");
  assert.equal(h.formatAmount(2), "2");
});

test("escapeHtml neutralizes markup", () => {
  assert.equal(h.escapeHtml(`<script>alert("x")</script>`), "&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;");
  assert.equal(h.escapeHtml("Bee's Knees & co"), "Bee&#039;s Knees &amp; co");
});

test("no-shaker is decided by the method, not by tags", () => {
  const stirred = recipe({ method: ["Stir with ice.", "Strain over a large cube."] });
  const shaken = recipe({ method: ["Shake all ingredients with ice.", "Strain into a coupe."] });
  const dryShake = recipe({ method: ["Dry shake without ice.", "Shake again with ice."] });
  const shakenInSummary = recipe({ summary: "Gin and mint, shaken briskly.", method: ["Combine and strain."] });

  assert.ok(stirred.effortTags.includes("no-shaker"));
  assert.ok(!shaken.effortTags.includes("no-shaker"));
  assert.ok(!dryShake.effortTags.includes("no-shaker"));
  assert.ok(!shakenInSummary.effortTags.includes("no-shaker"));
});

test("effort tags: easy, project, three-ingredient", () => {
  assert.ok(recipe().effortTags.includes("easy"));
  assert.ok(recipe().effortTags.includes("three-ingredient"));
  const big = recipe({ time: "10 min", required: ["a", "b", "c", "d", "e", "f"], ingredients: ["a", "b", "c", "d", "e", "f"] });
  assert.ok(big.effortTags.includes("project"));
  assert.ok(!big.effortTags.includes("easy"));
});

test("flavor tags are inferred from the recipe text", () => {
  assert.ok(recipe({ required: ["gin", "campari", "sweet vermouth"] }).flavorTags.includes("bitter"));
  assert.ok(recipe({ required: ["mezcal", "lime juice"] }).flavorTags.includes("smoky"));
  assert.ok(recipe({ type: "Rum Highball", required: ["dark rum", "ginger beer"] }).flavorTags.includes("sparkling"));
});

test("substitutions come from required ingredients that have a rule", () => {
  const swaps = h.recipeSubstitutions(recipe({ required: ["bourbon", "campari"] }));
  assert.deepEqual(swaps.map((swap) => swap.ingredient), ["bourbon"]);
});

test("search ignores case and accents and looks at ingredients and extra text", () => {
  const pina = recipe({ name: "Piña Colada", required: ["white rum", "coconut cream"] });
  assert.ok(h.recipeMatchesQuery(pina, "pina"));
  assert.ok(h.recipeMatchesQuery(pina, "  COCONUT "));
  assert.ok(h.recipeMatchesQuery(pina, "tiki mug", "Tiki mug or hurricane glass"));
  assert.ok(!h.recipeMatchesQuery(pina, "bourbon"));
  assert.ok(h.recipeMatchesQuery(pina, ""));
});

test("filters match tags, flavor tags, effort tags, and favorites", () => {
  const drink = recipe({ id: "negroni", tags: ["classic"], required: ["gin", "campari"] });
  assert.ok(h.recipeMatchesFilter(drink, "all"));
  assert.ok(h.recipeMatchesFilter(drink, "classic"));
  assert.ok(h.recipeMatchesFilter(drink, "bitter"));
  assert.ok(h.recipeMatchesFilter(drink, "no-shaker"));
  assert.ok(!h.recipeMatchesFilter(drink, "tiki"));
  assert.ok(!h.recipeMatchesFilter(drink, "favorites"));
  assert.ok(h.recipeMatchesFilter(drink, "favorites", new Set(["negroni"])));
});

test("buildRecipes turns blueprint tuples into recipe objects with derived fields", () => {
  const [built] = h.buildRecipes([
    ["x", "X", "Sour", ["classic"], "5 min", "Bright", "assets/citrus.jpg", "Summary.", ["2 oz gin"], ["gin"], ["Stir."], "coupe"],
  ]);
  assert.equal(built.id, "x");
  assert.equal(built.glass, "coupe");
  assert.equal(built.about, "");
  assert.deepEqual(built.variations, []);
  assert.ok(Array.isArray(built.flavorTags) && Array.isArray(built.effortTags) && Array.isArray(built.substitutions));
});
