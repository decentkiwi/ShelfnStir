import { db } from "../db.js";
import { json, jsonError } from "../respond.js";
import { buildRecipes } from "../../data/recipe-helpers.js";

// Same shape as db/fetch-recipes.js, but that one runs at build time with
// the `pg` client; this runs on the Worker with Neon's HTTP driver, so the
// query is duplicated rather than shared across two different client APIs.
async function fetchAllBlueprints(sql) {
  const rows = await sql`
    select
      r.id, r.name, r.type, r.summary, r.time_minutes, r.strength, r.image_path,
      coalesce((select array_agg(tag) from recipe_tags t where t.recipe_id = r.id), '{}') as tags,
      coalesce((select array_agg(display_text order by position) from recipe_ingredients i where i.recipe_id = r.id), '{}') as ingredients,
      coalesce((select array_agg(instruction order by position) from recipe_method_steps m where m.recipe_id = r.id), '{}') as method,
      coalesce((select array_agg(ingredient_id) from recipe_required_ingredients req where req.recipe_id = r.id), '{}') as required
    from recipes r
    order by r.name
  `;
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

export async function listRecipes(request, env) {
  const sql = db(env);
  const recipes = buildRecipes(await fetchAllBlueprints(sql));
  return json({
    recipes: recipes.map((r) => ({
      id: r.id,
      name: r.name,
      type: r.type,
      summary: r.summary,
      time: r.time,
      strength: r.strength,
      image: r.image,
      tags: r.tags,
      flavorTags: r.flavorTags,
      effortTags: r.effortTags,
      required: r.required,
    })),
  });
}

export async function getRecipe(request, env, ctx, params) {
  const sql = db(env);
  const recipes = buildRecipes(await fetchAllBlueprints(sql));
  const recipe = recipes.find((r) => r.id === params.recipeId);
  if (!recipe) return jsonError("Recipe not found", 404);
  return json(recipe);
}
