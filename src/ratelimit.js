import { jsonError } from "./respond.js";

// Cloudflare's Workers Rate Limiting binding. `limiter` is one of the
// bindings declared in wrangler.jsonc (unsafe.bindings, type "ratelimit").
// Keyed by client IP so one visitor can't exhaust another's budget.
export async function rateLimit(request, limiter) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const { success } = await limiter.limit({ key: ip });
  if (!success) return jsonError("Too many requests. Please slow down and try again shortly.", 429);
  return null;
}
