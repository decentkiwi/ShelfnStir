import { db } from "../db.js";
import { getSessionUser } from "../auth.js";
import { json, jsonError } from "../respond.js";

export async function listComments(request, env, ctx, params) {
  const sql = db(env);
  const rows = await sql`
    select c.id, c.body, c.created_at, u.display_name
    from comments c
    join users u on u.id = c.user_id
    where c.recipe_id = ${params.recipeId}
    order by c.created_at desc
  `;
  return json({
    comments: rows.map((r) => ({
      id: r.id,
      body: r.body,
      createdAt: r.created_at,
      displayName: r.display_name,
    })),
  });
}

export async function postComment(request, env, ctx, params) {
  const user = await getSessionUser(request, env);
  if (!user) return jsonError("Sign in to leave a comment", 401);

  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Invalid JSON body");

  const text = typeof body.body === "string" ? body.body.trim() : "";
  if (!text || text.length > 2000) return jsonError("Comment must be 1-2000 characters");

  const sql = db(env);
  const [recipe] = await sql`select id from recipes where id = ${params.recipeId}`;
  if (!recipe) return jsonError("Recipe not found", 404);

  const [comment] = await sql`
    insert into comments (recipe_id, user_id, body)
    values (${params.recipeId}, ${user.id}, ${text})
    returning id, body, created_at
  `;

  return json({
    id: comment.id,
    body: comment.body,
    createdAt: comment.created_at,
    displayName: user.displayName,
  });
}
