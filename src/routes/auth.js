import { db } from "../db.js";
import { hashPassword, verifyPassword, issueSessionToken, sessionCookieHeader, clearSessionCookieHeader, getSessionUser } from "../auth.js";
import { json, jsonError } from "../respond.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

export async function handleSignup(request, env) {
  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Invalid JSON body");

  const email = normalizeEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";
  const displayName = typeof body.displayName === "string" ? body.displayName.trim() : "";

  if (!EMAIL_RE.test(email)) return jsonError("Enter a valid email address");
  if (password.length < 8) return jsonError("Password must be at least 8 characters");
  if (!displayName || displayName.length > 40) return jsonError("Display name must be 1-40 characters");

  const sql = db(env);
  const [existing] = await sql`select id from users where email = ${email}`;
  if (existing) return jsonError("An account with that email already exists", 409);

  const passwordHash = await hashPassword(password);
  const [user] = await sql`
    insert into users (email, password_hash, display_name)
    values (${email}, ${passwordHash}, ${displayName})
    returning id, email, display_name
  `;

  const token = await issueSessionToken(env, user);
  return json(
    { id: user.id, email: user.email, displayName: user.display_name },
    { headers: { "Set-Cookie": sessionCookieHeader(request, token) } },
  );
}

export async function handleLogin(request, env) {
  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Invalid JSON body");

  const email = normalizeEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";

  const sql = db(env);
  const [user] = await sql`select id, email, password_hash, display_name from users where email = ${email}`;
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return jsonError("Incorrect email or password", 401);
  }

  const token = await issueSessionToken(env, user);
  return json(
    { id: user.id, email: user.email, displayName: user.display_name },
    { headers: { "Set-Cookie": sessionCookieHeader(request, token) } },
  );
}

export async function handleLogout(request) {
  return json({ ok: true }, { headers: { "Set-Cookie": clearSessionCookieHeader(request) } });
}

export async function handleMe(request, env) {
  const user = await getSessionUser(request, env);
  if (!user) return jsonError("Not signed in", 401);
  return json(user);
}
