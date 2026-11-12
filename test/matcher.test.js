const test = require("node:test");
const assert = require("node:assert/strict");

const h = require("../data/recipe-helpers.js");
const config = require("../data/pantry-config.js");
const { recipeBlueprints } = require("../data/recipes-data.js");

const recipes = h.buildRecipes(recipeBlueprints);
const names = (matches) => matches.map((match) => match.name);

test("expandShelf adds equivalents without changing the input", () => {
  const selected = new Set(["bourbon", "prosecco"]);
  const expanded = h.expandShelf(selected, config.ingredientEquivalents);
  assert.ok(expanded.has("whiskey"));
  assert.ok(expanded.has("sparkling wine"));
  assert.equal(selected.size, 2);
});

test("ingredientCost ranks specialty bottles above staples above easy grabs", () => {
  assert.equal(h.ingredientCost("green chartreuse", config), 4);
  assert.equal(h.ingredientCost("gin", config), 3);
  assert.equal(h.ingredientCost("angostura bitters", config), 2);
  assert.equal(h.ingredientCost("lime juice", config), 1);
});

test("an empty shelf only matches recipes with at most two ingredients", () => {
  const matches = h.pantryMatches(recipes, new Set(), config);
  assert.ok(matches.every((match) => match.required.length <= 2));
  assert.ok(matches.every((match) => match.missing.length === match.required.length));
});

test("a Negroni shelf makes a Negroni and is one bottle from a Boulevardier", () => {
  const shelf = new Set(["gin", "campari", "sweet vermouth", "orange"]);
  const matches = h.pantryMatches(recipes, shelf, config);
  const negroni = matches.find((match) => match.id === "negroni");
  const boulevardier = matches.find((match) => match.id === "boulevardier");
  assert.deepEqual(negroni.missing, []);
  assert.equal(negroni.score, 1);
  assert.equal(boulevardier.missing.length, 1);
});

test("equivalents satisfy category ingredients", () => {
  const usesWhiskey = recipes.filter((recipe) => recipe.required.includes("whiskey"));
  assert.ok(usesWhiskey.length > 0, "expected at least one recipe that requires generic whiskey");
  for (const recipe of usesWhiskey) {
    const withRye = h.matchRecipe(recipe, h.expandShelf(new Set(["rye whiskey"]), config.ingredientEquivalents), config);
    assert.ok(!withRye.missing.includes("whiskey"), `${recipe.name} should accept rye as whiskey`);
  }
});

test("matches never miss more than two ingredients and are sorted by readiness", () => {
  const matches = h.pantryMatches(recipes, new Set(config.presets.starter), config);
  assert.ok(matches.length > 0);
  assert.ok(matches.every((match) => match.missing.length <= 2));
  for (let i = 1; i < matches.length; i++) {
    const prev = matches[i - 1];
    const next = matches[i];
    assert.ok(prev.missing.length <= next.missing.length, `${prev.name} should sort before ${next.name}`);
    if (prev.missing.length === next.missing.length) {
      assert.ok(prev.shoppingPain <= next.shoppingPain, `${prev.name} should cost no more than ${next.name}`);
    }
  }
});

test("every preset can make at least one drink right now", () => {
  for (const [key, items] of Object.entries(config.presets)) {
    const ready = h.pantryMatches(recipes, new Set(items), config).filter((match) => match.missing.length === 0);
    assert.ok(ready.length > 0, `preset "${key}" makes nothing`);
  }
});

test("the zero-proof preset never suggests an alcoholic drink as ready", () => {
  const ready = h.pantryMatches(recipes, new Set(config.presets.zero), config).filter((match) => match.missing.length === 0);
  assert.ok(ready.every((match) => match.tags.includes("zero-proof")), `ready: ${names(ready).join(", ")}`);
});

test("bestNextBuys ranks single ingredients by how many recipes they unlock", () => {
  const shelf = new Set(["gin", "lime juice", "lemon juice", "simple syrup"]);
  const matches = h.pantryMatches(recipes, shelf, config);
  const buys = h.bestNextBuys(matches, shelf, config);
  assert.ok(buys.length > 0 && buys.length <= 3);
  for (const buy of buys) {
    assert.ok(!shelf.has(buy.ingredient));
    assert.ok(buy.names.length >= 1);
  }
  for (let i = 1; i < buys.length; i++) {
    assert.ok(buys[i - 1].names.length >= buys[i].names.length);
  }
  // Buying the top suggestion really does make those drinks.
  const after = h.pantryMatches(recipes, new Set([...shelf, buys[0].ingredient]), config);
  for (const name of buys[0].names) {
    assert.deepEqual(after.find((match) => match.name === name).missing, []);
  }
});

test("bestNextBuys returns nothing when no single ingredient completes a drink", () => {
  assert.deepEqual(h.bestNextBuys([], new Set(), config), []);
});
