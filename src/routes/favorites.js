import { db } from "../db.js";
import { getSessionUser } from "../auth.js";
import { json, jsonError } from "../respond.js";

export async function listFavorites(request, env) {
  const user = await getSessionUser(request, env);
  if (!user) return jsonError("Not signed in", 401);
  const sql = db(env);
  const rows = await sql`select recipe_id from favorites where user_id = ${user.id} order by created_at desc`;
  return json({ recipeIds: rows.map((r) => r.recipe_id) });
}

export async function addFavorite(request, env, ctx, params) {
  const user = await getSessionUser(request, env);
  if (!user) return jsonError("Not signed in", 401);
  const sql = db(env);
  const [recipe] = await sql`select id from recipes where id = ${params.recipeId}`;
  if (!recipe) return jsonError("Recipe not found", 404);
  await sql`insert into favorites (user_id, recipe_id) values (${user.id}, ${params.recipeId}) on conflict do nothing`;
  return json({ ok: true });
}

export async function removeFavorite(request, env, ctx, params) {
  const user = await getSessionUser(request, env);
  if (!user) return jsonError("Not signed in", 401);
  const sql = db(env);
  await sql`delete from favorites where user_id = ${user.id} and recipe_id = ${params.recipeId}`;
  return json({ ok: true });
}
