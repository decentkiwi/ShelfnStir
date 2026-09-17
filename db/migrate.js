// Applies db/schema.sql, then seeds recipes/ingredients from data/recipes-data.js.
// Safe to re-run: schema uses IF NOT EXISTS, seed data uses upserts.
// Usage: npm run migrate  (reads DATABASE_URL_UNPOOLED from .env.local)

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const { loadEnvLocal } = require("./env.js");

loadEnvLocal();

const { recipeBlueprints, ingredientGroups, ingredientEquivalents } = require("../data/recipes-data.js");

function categoryOf(ingredientGroups, name) {
  const group = ingredientGroups.find((g) => g.items.includes(name));
  return group ? group.key : null;
}

// Ingredients that only exist as a category alias (e.g. "whiskey", satisfied
// by selecting "bourbon" or "rye whiskey" via ingredientEquivalents) rather
// than as their own selectable pantry item.
function virtualIngredients(ingredientGroups, ingredientEquivalents) {
  const known = new Set(ingredientGroups.flatMap((g) => g.items));
  const virtual = new Map();
  for (const [source, targets] of Object.entries(ingredientEquivalents)) {
    for (const target of targets) {
      if (known.has(target) || virtual.has(target)) continue;
      const category = categoryOf(ingredientGroups, source);
      if (category) virtual.set(target, category);
    }
  }
  return virtual;
}

async function main() {
  const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Missing DATABASE_URL(_UNPOOLED) - run `neon link` first or check .env.local");
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    console.log("Applying schema.sql...");
    const schemaSql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
    await client.query(schemaSql);

    console.log("Seeding ingredients...");
    await client.query("BEGIN");

    for (const group of ingredientGroups) {
      for (const name of group.items) {
        await client.query(
          `insert into ingredients (id, category, is_selectable) values ($1, $2, true)
           on conflict (id) do update set category = excluded.category, is_selectable = true`,
          [name, group.key],
        );
      }
    }

    const virtual = virtualIngredients(ingredientGroups, ingredientEquivalents);
    for (const [name, category] of virtual) {
      await client.query(
        `insert into ingredients (id, category, is_selectable) values ($1, $2, false)
         on conflict (id) do update set category = excluded.category, is_selectable = false`,
        [name, category],
      );
    }

    // Sanity check: every "required" ingredient referenced by a recipe must
    // exist in the canonical ingredients table (literal or virtual/alias),
    // otherwise the pantry matcher's foreign key insert below will fail loudly.
    const knownIngredients = new Set([...ingredientGroups.flatMap((group) => group.items), ...virtual.keys()]);

    console.log(`Seeding ${recipeBlueprints.length} recipes...`);
    for (const [id, name, type, tags, time, strength, image, summary, ingredientsList, required, method] of recipeBlueprints) {
      const timeMinutes = Number.parseInt(time, 10);

      await client.query(
        `insert into recipes (id, name, type, summary, time_minutes, strength, image_path)
         values ($1, $2, $3, $4, $5, $6, $7)
         on conflict (id) do update set
           name = excluded.name,
           type = excluded.type,
           summary = excluded.summary,
           time_minutes = excluded.time_minutes,
           strength = excluded.strength,
           image_path = excluded.image_path`,
        [id, name, type, summary, timeMinutes, strength, image],
      );

      await client.query("delete from recipe_tags where recipe_id = $1", [id]);
      for (const tag of tags) {
        await client.query("insert into recipe_tags (recipe_id, tag) values ($1, $2)", [id, tag]);
      }

      await client.query("delete from recipe_ingredients where recipe_id = $1", [id]);
      for (const [position, displayText] of ingredientsList.entries()) {
        await client.query(
          "insert into recipe_ingredients (recipe_id, position, display_text) values ($1, $2, $3)",
          [id, position, displayText],
        );
      }

      await client.query("delete from recipe_method_steps where recipe_id = $1", [id]);
      for (const [position, instruction] of method.entries()) {
        await client.query(
          "insert into recipe_method_steps (recipe_id, position, instruction) values ($1, $2, $3)",
          [id, position, instruction],
        );
      }

      await client.query("delete from recipe_required_ingredients where recipe_id = $1", [id]);
      for (const ingredientId of required) {
        if (!knownIngredients.has(ingredientId)) {
          throw new Error(`Recipe "${id}" requires unknown ingredient "${ingredientId}" (not in ingredientGroups)`);
        }
        await client.query(
          "insert into recipe_required_ingredients (recipe_id, ingredient_id) values ($1, $2)",
          [id, ingredientId],
        );
      }
    }

    await client.query("COMMIT");
    console.log("Migration complete.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
