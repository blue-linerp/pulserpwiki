#!/usr/bin/env node
/**
 * migrate.mjs
 * One-time script: reads your local wiki.db and pushes all rows to Turso.
 *
 * Usage (run locally, NOT on Vercel):
 *   TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... node migrate.mjs
 *
 * Requires:  npm install @libsql/client better-sqlite3
 */

import Database from "better-sqlite3";
import { createClient } from "@libsql/client";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url || !authToken) {
  console.error("Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN before running.");
  process.exit(1);
}

const src = new Database(path.join(__dirname, "data", "wiki.db"), { readonly: true });
const dst = createClient({ url, authToken });

async function main() {
  // Ensure schema
  await dst.executeMultiple(`
    CREATE TABLE IF NOT EXISTS users (
      steam_id TEXT PRIMARY KEY, persona TEXT, avatar TEXT,
      profile_url TEXT, role TEXT NOT NULL DEFAULT 'user', created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS pages (
      slug TEXT PRIMARY KEY, data TEXT NOT NULL,
      is_custom INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL, updated_by TEXT
    );
    CREATE TABLE IF NOT EXISTS hidden_pages (
      slug TEXT PRIMARY KEY, hidden_at INTEGER NOT NULL, hidden_by TEXT
    );
  `);

  const users = src.prepare("SELECT * FROM users").all();
  for (const u of users) {
    await dst.execute({
      sql: `INSERT OR REPLACE INTO users(steam_id,persona,avatar,profile_url,role,created_at)
            VALUES (?,?,?,?,?,?)`,
      args: [u.steam_id, u.persona, u.avatar, u.profile_url, u.role, u.created_at],
    });
  }
  console.log(`✔ Migrated ${users.length} user(s)`);

  const pages = src.prepare("SELECT * FROM pages").all();
  for (const p of pages) {
    await dst.execute({
      sql: `INSERT OR REPLACE INTO pages(slug,data,is_custom,updated_at,updated_by)
            VALUES (?,?,?,?,?)`,
      args: [p.slug, p.data, p.is_custom, p.updated_at, p.updated_by],
    });
  }
  console.log(`✔ Migrated ${pages.length} page(s)`);

  const hidden = src.prepare("SELECT * FROM hidden_pages").all();
  for (const h of hidden) {
    await dst.execute({
      sql: `INSERT OR REPLACE INTO hidden_pages(slug,hidden_at,hidden_by) VALUES (?,?,?)`,
      args: [h.slug, h.hidden_at, h.hidden_by],
    });
  }
  console.log(`✔ Migrated ${hidden.length} hidden page(s)`);

  console.log("\n✅ Migration complete!");
}

main().catch((e) => { console.error(e); process.exit(1); });
