import { db } from "../db.js";
import { json } from "../respond.js";

// The ingredient catalog (name + category) for pantry-picker UIs. Presets,
// substitution equivalents, and cost-tier classification are app config,
// not content, so (like data/pantry-config.js on the website) they're not
// served here -- each client hardcodes its own copy of that logic.
export async function listIngredients(request, env) {
  const sql = db(env);
  const rows = await sql`
    select id, category, is_selectable
    from ingredients
    order by category, id
  `;
  return json({
    ingredients: rows.map((r) => ({ id: r.id, category: r.category, isSelectable: r.is_selectable })),
  });
}
