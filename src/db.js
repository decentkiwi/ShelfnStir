import { neon } from "@neondatabase/serverless";

export function db(env) {
  return neon(env.DATABASE_URL);
}
