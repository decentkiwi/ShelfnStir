import { db } from "../db.js";
import { getSessionUser } from "../auth.js";
import { json, jsonError } from "../respond.js";

export async function getRatings(request, env, ctx, params) {
  const sql = db(env);
  const [summary] = await sql`
    select round(avg(rating)::numeric, 2) as average, count(*)::int as count
    from ratings
    where recipe_id = ${params.recipeId}
  `;
  return json({
    average: summary.count > 0 ? Number(summary.average) : null,
    count: summary.count,
  });
}

export async function submitRating(request, env, ctx, params) {
  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Invalid JSON body");

  const rating = Number(body.rating);
  const voterToken = typeof body.voterToken === "string" ? body.voterToken.trim() : "";

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return jsonError("rating must be an integer 1-5");
  if (voterToken.length < 8 || voterToken.length > 100) return jsonError("voterToken is required");

  const sql = db(env);
  const [recipe] = await sql`select id from recipes where id = ${params.recipeId}`;
  if (!recipe) return jsonError("Recipe not found", 404);

  const user = await getSessionUser(request, env);

  await sql`
    insert into ratings (recipe_id, rating, voter_token, user_id)
    values (${params.recipeId}, ${rating}, ${voterToken}, ${user ? user.id : null})
    on conflict (recipe_id, voter_token)
    do update set rating = excluded.rating, user_id = excluded.user_id
  `;

  return json({ ok: true });
}
