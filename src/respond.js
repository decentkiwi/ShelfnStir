// Every API response is JSON that may be personal (sessions, favorites), so
// the default is "never cache, never sniff". Public, read-only catalog
// endpoints opt in to caching by passing their own Cache-Control.
const BASE_HEADERS = {
  "Content-Type": "application/json",
  "X-Content-Type-Options": "nosniff",
  "Cache-Control": "no-store",
};

export const PUBLIC_CACHE = { "Cache-Control": "public, max-age=300" };

export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { ...BASE_HEADERS, ...(init.headers || {}) },
  });
}

export function jsonError(message, status = 400) {
  return json({ error: message }, { status });
}
