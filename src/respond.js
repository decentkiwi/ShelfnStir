export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
  });
}

export function jsonError(message, status = 400) {
  return json({ error: message }, { status });
}
