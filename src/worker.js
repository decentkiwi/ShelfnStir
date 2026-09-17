import { handleSignup, handleLogin, handleLogout, handleMe } from "./routes/auth.js";
import { listFavorites, addFavorite, removeFavorite } from "./routes/favorites.js";
import { getShelf, putShelf } from "./routes/shelf.js";
import { jsonError } from "./respond.js";

const routes = [
  { method: "POST", pattern: /^\/api\/auth\/signup$/, handler: handleSignup },
  { method: "POST", pattern: /^\/api\/auth\/login$/, handler: handleLogin },
  { method: "POST", pattern: /^\/api\/auth\/logout$/, handler: handleLogout },
  { method: "GET", pattern: /^\/api\/me$/, handler: handleMe },
  { method: "GET", pattern: /^\/api\/favorites$/, handler: listFavorites },
  { method: "PUT", pattern: /^\/api\/favorites\/(?<recipeId>[a-z0-9-]+)$/, handler: addFavorite },
  { method: "DELETE", pattern: /^\/api\/favorites\/(?<recipeId>[a-z0-9-]+)$/, handler: removeFavorite },
  { method: "GET", pattern: /^\/api\/shelf$/, handler: getShelf },
  { method: "PUT", pattern: /^\/api\/shelf$/, handler: putShelf },
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
