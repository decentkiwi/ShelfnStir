import { db } from "../db.js";
import { getSessionUser } from "../auth.js";
import { json, jsonError } from "../respond.js";

const MAX_SHELF_SIZE = 200;

export async function getShelf(request, env) {
  const user = await getSessionUser(request, env);
  if (!user) return jsonError("Not signed in", 401);
  const sql = db(env);
  const rows = await sql`select ingredient_id from shelves where user_id = ${user.id}`;
  return json({ ingredientIds: rows.map((r) => r.ingredient_id) });
}

export async function putShelf(request, env) {
  const user = await getSessionUser(request, env);
  if (!user) return jsonError("Not signed in", 401);

  const body = await request.json().catch(() => null);
  if (!body || !Array.isArray(body.ingredientIds)) return jsonError("ingredientIds must be an array");

  const ingredientIds = [...new Set(body.ingredientIds)].filter((id) => typeof id === "string");
  if (ingredientIds.length > MAX_SHELF_SIZE) return jsonError(`Too many ingredients (max ${MAX_SHELF_SIZE})`);

  const sql = db(env);

  if (ingredientIds.length) {
    const known = await sql`select id from ingredients where id = any(${ingredientIds})`;
    const knownSet = new Set(known.map((r) => r.id));
    const unknown = ingredientIds.filter((id) => !knownSet.has(id));
    if (unknown.length) return jsonError(`Unknown ingredient(s): ${unknown.join(", ")}`);
  }

  await sql.transaction((txn) => [
    txn`delete from shelves where user_id = ${user.id}`,
    ...ingredientIds.map((id) => txn`insert into shelves (user_id, ingredient_id) values (${user.id}, ${id})`),
  ]);

  return json({ ok: true });
}
