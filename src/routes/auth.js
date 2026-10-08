import { db } from "../db.js";
import { hashPassword, verifyPassword, issueSessionToken, sessionCookieHeader, clearSessionCookieHeader, getSessionUser } from "../auth.js";
import { json, jsonError } from "../respond.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;
const MAX_PASSWORD_LENGTH = 128;

// A well-formed hash that matches nothing. Login verifies against it when the
// email isn't registered, so "no such account" takes as long as "wrong
// password" and response timing can't be used to discover who has an account.
const DUMMY_HASH = `pbkdf2$100000$${"0".repeat(32)}$${"0".repeat(64)}`;

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

export async function handleSignup(request, env) {
  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Invalid JSON body");

  const email = normalizeEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";
  const displayName = typeof body.displayName === "string" ? body.displayName.trim() : "";

  if (!EMAIL_RE.test(email) || email.length > MAX_EMAIL_LENGTH) return jsonError("Enter a valid email address");
  if (password.length < 8) return jsonError("Password must be at least 8 characters");
  if (password.length > MAX_PASSWORD_LENGTH) return jsonError(`Password must be at most ${MAX_PASSWORD_LENGTH} characters`);
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
    { id: Number(user.id), email: user.email, displayName: user.display_name },
    { headers: { "Set-Cookie": sessionCookieHeader(request, token) } },
  );
}

export async function handleLogin(request, env) {
  const body = await request.json().catch(() => null);
  if (!body) return jsonError("Invalid JSON body");

  const email = normalizeEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";

  if (password.length > MAX_PASSWORD_LENGTH || email.length > MAX_EMAIL_LENGTH) {
    return jsonError("Incorrect email or password", 401);
  }

  const sql = db(env);
  const [user] = await sql`select id, email, password_hash, display_name from users where email = ${email}`;
  const passwordOk = await verifyPassword(password, user ? user.password_hash : DUMMY_HASH);
  if (!user || !passwordOk) {
    return jsonError("Incorrect email or password", 401);
  }

  const token = await issueSessionToken(env, user);
  return json(
    { id: Number(user.id), email: user.email, displayName: user.display_name },
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

// Required by App Store Review Guideline 5.1.1(v): any app that lets people
// create an account must also let them delete it, in-app. Requires the
// current password so a stolen session cookie alone can't destroy the
// account. Deleting the user row cascades to favorites/shelves/comments and
// nulls out ratings.user_id (schema.sql), so no orphaned-but-owned data
// remains, while anonymous rating counts stay intact.
export async function handleDeleteAccount(request, env) {
  const sessionUser = await getSessionUser(request, env);
  if (!sessionUser) return jsonError("Not signed in", 401);

  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";
  if (!password) return jsonError("Enter your password to confirm");

  const sql = db(env);
  const [user] = await sql`select password_hash from users where id = ${sessionUser.id}`;
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return jsonError("Incorrect password", 401);
  }

  await sql`delete from users where id = ${sessionUser.id}`;
  return json({ ok: true }, { headers: { "Set-Cookie": clearSessionCookieHeader(request) } });
}
