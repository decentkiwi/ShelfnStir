// Guards the recipe content itself: these fail when a recipe is added or
// edited in a way the site can't render or match correctly.
const test = require("node:test");
const assert = require("node:assert/strict");

const h = require("../data/recipe-helpers.js");
const config = require("../data/pantry-config.js");
const { recipeBlueprints, ingredientGroups } = require("../data/recipes-data.js");
const { glassByKey, recipeGlass } = require("../data/glassware.js");
const recipeNotes = require("../db/recipe-notes.js");

const recipes = h.buildRecipes(recipeBlueprints);
const selectable = new Set(ingredientGroups.flatMap((group) => group.items));
const viaEquivalents = new Set(Object.values(config.ingredientEquivalents).flat());

test("recipe ids are unique URL slugs", () => {
  const ids = recipes.map((recipe) => recipe.id);
  assert.equal(new Set(ids).size, ids.length);
  ids.forEach((id) => assert.match(id, /^[a-z0-9-]+$/));
});

test("every recipe has the fields a page needs", () => {
  for (const recipe of recipes) {
    assert.ok(recipe.name && recipe.type && recipe.summary && recipe.strength, recipe.id);
    assert.match(recipe.time, /^\d+ min$/, recipe.id);
    assert.ok(recipe.ingredients.length >= 2, recipe.id);
    assert.ok(recipe.method.length >= 2, recipe.id);
    assert.ok(recipe.required.length >= 1, recipe.id);
  }
});

test("every required ingredient can be satisfied from the pantry picker", () => {
  for (const recipe of recipes) {
    for (const ingredient of recipe.required) {
      assert.ok(selectable.has(ingredient) || viaEquivalents.has(ingredient), `${recipe.id} requires "${ingredient}", which nobody can select`);
    }
  }
});

test("every recipe has a known glass, in both the data and the seed", () => {
  for (const recipe of recipes) {
    assert.ok(glassByKey[recipe.glass], `${recipe.id} has glass "${recipe.glass}"`);
    assert.equal(recipeGlass[recipe.id], recipe.glass, `${recipe.id}: seed and database disagree`);
  }
});

test("the glass matches what the method says", () => {
  const mentions = { coupe: /\bcoupe\b/i, rocks: /\brocks glass\b/i, flute: /\bflute\b/i, collins: /\bcollins glass\b/i, highball: /\bin a highball\b/i, wine: /\bwine glass\b/i };
  for (const recipe of recipes) {
    const method = recipe.method.join(" ");
    for (const [glass, pattern] of Object.entries(mentions)) {
      if (pattern.test(method)) assert.equal(recipe.glass, glass, `${recipe.id} method mentions a ${glass}`);
    }
  }
});

test("no drink whose method says to shake is listed as no-shaker", () => {
  for (const recipe of recipes) {
    if (/\bshak/i.test(recipe.method.join(" "))) {
      assert.ok(!recipe.effortTags.includes("no-shaker"), recipe.id);
    }
  }
  assert.ok(recipes.some((recipe) => recipe.effortTags.includes("no-shaker")));
});

test("every recipe has notes, and there are no notes for unknown recipes", () => {
  const ids = new Set(recipes.map((recipe) => recipe.id));
  for (const id of ids) {
    const notes = recipeNotes[id];
    assert.ok(notes, `${id} has no entry in db/recipe-notes.js`);
    assert.ok(notes.about.length >= 120, `${id}: about text is too short`);
    assert.ok(notes.variations.length >= 2, `${id}: needs at least two variations`);
    notes.variations.forEach((variation) => assert.match(variation, /^[^:]+: .+\.$/, `${id}: "${variation}" should read "Name: sentence."`));
  }
  Object.keys(recipeNotes).forEach((id) => assert.ok(ids.has(id), `notes for unknown recipe "${id}"`));
});

test("presets and cost tiers only reference real ingredients", () => {
  const known = new Set([...selectable, ...viaEquivalents]);
  const lists = { ...config.presets, easyGrab: config.easyGrabIngredients, staples: config.pantryStaples, specialty: config.specialtyIngredients };
  for (const [name, items] of Object.entries(lists)) {
    items.forEach((item) => assert.ok(known.has(item), `${name} lists unknown ingredient "${item}"`));
  }
});

test("egg recipes are detectable for the raw-egg safety note", () => {
  const withEgg = recipes.filter((recipe) => recipe.ingredients.some((ingredient) => /\begg\b/i.test(ingredient)));
  assert.deepEqual(withEgg.map((recipe) => recipe.id).sort(), ["clover-club", "ramos-gin-fizz", "whiskey-sour"]);
});
