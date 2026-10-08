import { handleSignup, handleLogin, handleLogout, handleMe, handleDeleteAccount } from "./routes/auth.js";
import { listFavorites, addFavorite, removeFavorite } from "./routes/favorites.js";
import { getShelf, putShelf } from "./routes/shelf.js";
import { getRatings, submitRating } from "./routes/ratings.js";
import { listComments, postComment } from "./routes/comments.js";
import { listRecipes, getRecipe } from "./routes/recipes.js";
import { listIngredients } from "./routes/ingredients.js";
import { jsonError } from "./respond.js";
import { rateLimit } from "./ratelimit.js";

// Largest legitimate body is a full pantry shelf (200 ids, a few KB).
const MAX_BODY_BYTES = 32 * 1024;

// Defense in depth on top of SameSite=Lax cookies: a state-changing request
// that carries an Origin header must come from this site. Native apps send no
// Origin header, so they pass; browsers always send one on cross-site writes.
function rejectUnsafeWrite(request, url) {
  if (request.method === "GET" || request.method === "HEAD") return null;
  const origin = request.headers.get("Origin");
  if (origin && origin !== url.origin) return jsonError("Cross-origin requests are not allowed", 403);
  if (Number(request.headers.get("Content-Length") || 0) > MAX_BODY_BYTES) return jsonError("Request too large", 413);
  return null;
}

const routes = [
  { method: "GET", pattern: /^\/api\/recipes$/, handler: listRecipes },
  { method: "GET", pattern: /^\/api\/ingredients$/, handler: listIngredients },
  { method: "GET", pattern: /^\/api\/recipes\/(?<recipeId>[a-z0-9-]+)$/, handler: getRecipe },
  { method: "POST", pattern: /^\/api\/auth\/signup$/, handler: handleSignup, limiter: "AUTH_LIMITER" },
  { method: "POST", pattern: /^\/api\/auth\/login$/, handler: handleLogin, limiter: "AUTH_LIMITER" },
  { method: "POST", pattern: /^\/api\/auth\/logout$/, handler: handleLogout },
  { method: "GET", pattern: /^\/api\/me$/, handler: handleMe },
  { method: "DELETE", pattern: /^\/api\/me$/, handler: handleDeleteAccount, limiter: "AUTH_LIMITER" },
  { method: "GET", pattern: /^\/api\/favorites$/, handler: listFavorites },
  { method: "PUT", pattern: /^\/api\/favorites\/(?<recipeId>[a-z0-9-]+)$/, handler: addFavorite, limiter: "WRITE_LIMITER" },
  { method: "DELETE", pattern: /^\/api\/favorites\/(?<recipeId>[a-z0-9-]+)$/, handler: removeFavorite, limiter: "WRITE_LIMITER" },
  { method: "GET", pattern: /^\/api\/shelf$/, handler: getShelf },
  { method: "PUT", pattern: /^\/api\/shelf$/, handler: putShelf, limiter: "WRITE_LIMITER" },
  { method: "GET", pattern: /^\/api\/recipes\/(?<recipeId>[a-z0-9-]+)\/ratings$/, handler: getRatings },
  { method: "POST", pattern: /^\/api\/recipes\/(?<recipeId>[a-z0-9-]+)\/ratings$/, handler: submitRating, limiter: "WRITE_LIMITER" },
  { method: "GET", pattern: /^\/api\/recipes\/(?<recipeId>[a-z0-9-]+)\/comments$/, handler: listComments },
  { method: "POST", pattern: /^\/api\/recipes\/(?<recipeId>[a-z0-9-]+)\/comments$/, handler: postComment, limiter: "AUTH_LIMITER" },
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      const rejected = rejectUnsafeWrite(request, url);
      if (rejected) return rejected;
      for (const route of routes) {
        if (route.method !== request.method) continue;
        const match = url.pathname.match(route.pattern);
        if (!match) continue;
        try {
          if (route.limiter) {
            const limited = await rateLimit(request, env[route.limiter]);
            if (limited) return limited;
          }
          return await route.handler(request, env, ctx, match.groups || {});
        } catch (error) {
          console.error(error);
          return jsonError("Internal server error", 500);
        }
      }
      return jsonError("Not found", 404);
    }

    return env.ASSETS.fetch(request);
  },
};
