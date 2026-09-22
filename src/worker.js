import { handleSignup, handleLogin, handleLogout, handleMe } from "./routes/auth.js";
import { listFavorites, addFavorite, removeFavorite } from "./routes/favorites.js";
import { getShelf, putShelf } from "./routes/shelf.js";
import { getRatings, submitRating } from "./routes/ratings.js";
import { listComments, postComment } from "./routes/comments.js";
import { jsonError } from "./respond.js";
import { rateLimit } from "./ratelimit.js";

const routes = [
  { method: "POST", pattern: /^\/api\/auth\/signup$/, handler: handleSignup, limiter: "AUTH_LIMITER" },
  { method: "POST", pattern: /^\/api\/auth\/login$/, handler: handleLogin, limiter: "AUTH_LIMITER" },
  { method: "POST", pattern: /^\/api\/auth\/logout$/, handler: handleLogout },
  { method: "GET", pattern: /^\/api\/me$/, handler: handleMe },
  { method: "GET", pattern: /^\/api\/favorites$/, handler: listFavorites },
  { method: "PUT", pattern: /^\/api\/favorites\/(?<recipeId>[a-z0-9-]+)$/, handler: addFavorite, limiter: "WRITE_LIMITER" },
  { method: "DELETE", pattern: /^\/api\/favorites\/(?<recipeId>[a-z0-9-]+)$/, handler: removeFavorite, limiter: "WRITE_LIMITER" },
  { method: "GET", pattern: /^\/api\/shelf$/, handler: getShelf },
  { method: "PUT", pattern: /^\/api\/shelf$/, handler: putShelf, limiter: "WRITE_LIMITER" },
  { method: "GET", pattern: /^\/api\/recipes\/(?<recipeId>[a-z0-9-]+)\/ratings$/, handler: getRatings },
  { method: "POST", pattern: /^\/api\/recipes\/(?<recipeId>[a-z0-9-]+)\/ratings$/, handler: submitRating, limiter: "WRITE_LIMITER" },
  { method: "GET", pattern: /^\/api\/recipes\/(?<recipeId>[a-z0-9-]+)\/comments$/, handler: listComments },
  { method: "POST", pattern: /^\/api\/recipes\/(?<recipeId>[a-z0-9-]+)\/comments$/, handler: postComment, limiter: "WRITE_LIMITER" },
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
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
