// Reads recipe content back out of Postgres, shaped exactly like the old
// hand-written data/recipes-data.js, so build.js can regenerate that file
// as a build artifact and nothing downstream (recipe-helpers.js, script.js)
// has to change.

const CATEGORY_TITLES = {
  spirits: "Spirits",
  liqueurs: "Liqueurs & Aperitifs",
  produce: "Citrus & Produce",
  mixers: "Mixers & Bubbles",
  pantry: "Sweeteners, Bitters & Pantry",
};
const CATEGORY_ORDER = ["spirits", "liqueurs", "produce", "mixers", "pantry"];

async function fetchRecipeBlueprints(client) {
  const { rows } = await client.query(`
    select
      r.id, r.name, r.type, r.summary, r.time_minutes, r.strength, r.image_path,
      coalesce((select array_agg(tag) from recipe_tags t where t.recipe_id = r.id), '{}') as tags,
      coalesce((select array_agg(display_text order by position) from recipe_ingredients i where i.recipe_id = r.id), '{}') as ingredients,
      coalesce((select array_agg(instruction order by position) from recipe_method_steps m where m.recipe_id = r.id), '{}') as method,
      coalesce((select array_agg(ingredient_id) from recipe_required_ingredients req where req.recipe_id = r.id), '{}') as required
    from recipes r
    order by r.id
  `);

  return rows.map((row) => [
    row.id,
    row.name,
    row.type,
    row.tags,
    `${row.time_minutes} min`,
    row.strength,
    row.image_path,
    row.summary,
    row.ingredients,
    row.required,
    row.method,
  ]);
}

async function fetchIngredientGroups(client) {
  const { rows } = await client.query(`
    select category, array_agg(id order by id) as items
    from ingredients
    where is_selectable = true
    group by category
  `);
  const byCategory = new Map(rows.map((row) => [row.category, row.items]));
  return CATEGORY_ORDER.filter((key) => byCategory.has(key)).map((key) => ({
    key,
    title: CATEGORY_TITLES[key],
    items: byCategory.get(key),
  }));
}

module.exports = { fetchRecipeBlueprints, fetchIngredientGroups };
