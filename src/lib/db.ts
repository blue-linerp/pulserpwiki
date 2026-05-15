import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const DB_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DB_DIR, "wiki.db");

if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

declare global {
  // eslint-disable-next-line no-var
  var __pulse_db: Database.Database | undefined;
}

export const db: Database.Database =
  global.__pulse_db ??
  (() => {
    const d = new Database(DB_PATH);
    d.pragma("journal_mode = WAL");
    d.exec(`
      CREATE TABLE IF NOT EXISTS users (
        steam_id    TEXT PRIMARY KEY,
        persona     TEXT,
        avatar      TEXT,
        profile_url TEXT,
        role        TEXT NOT NULL DEFAULT 'user',
        created_at  INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS pages (
        slug       TEXT PRIMARY KEY,
        data       TEXT NOT NULL,
        is_custom  INTEGER NOT NULL DEFAULT 0,
        updated_at INTEGER NOT NULL,
        updated_by TEXT
      );

      CREATE TABLE IF NOT EXISTS hidden_pages (
        slug       TEXT PRIMARY KEY,
        hidden_at  INTEGER NOT NULL,
        hidden_by  TEXT
      );
    `);
    return d;
  })();

if (process.env.NODE_ENV !== "production") global.__pulse_db = db;

export interface DbUser {
  steam_id: string;
  persona: string | null;
  avatar: string | null;
  profile_url: string | null;
  role: "admin" | "user";
  created_at: number;
}

export const Users = {
  count(): number {
    return (db.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number }).c;
  },
  get(steamId: string): DbUser | undefined {
    return db.prepare("SELECT * FROM users WHERE steam_id = ?").get(steamId) as DbUser | undefined;
  },
  all(): DbUser[] {
    return db.prepare("SELECT * FROM users ORDER BY created_at DESC").all() as DbUser[];
  },
  setRole(steamId: string, role: "admin" | "user"): DbUser | undefined {
    db.prepare("UPDATE users SET role=? WHERE steam_id=?").run(role, steamId);
    return Users.get(steamId);
  },
  upsert(u: Omit<DbUser, "created_at"> & { created_at?: number }): DbUser {
    const existing = Users.get(u.steam_id);
    if (existing) {
      db.prepare(
        "UPDATE users SET persona=?, avatar=?, profile_url=? WHERE steam_id=?"
      ).run(u.persona, u.avatar, u.profile_url, u.steam_id);
      return Users.get(u.steam_id)!;
    }
    const role: "admin" | "user" = Users.count() === 0 ? "admin" : (u.role || "user");
    const created_at = Date.now();
    db.prepare(
      "INSERT INTO users(steam_id, persona, avatar, profile_url, role, created_at) VALUES (?,?,?,?,?,?)"
    ).run(u.steam_id, u.persona, u.avatar, u.profile_url, role, created_at);
    return Users.get(u.steam_id)!;
  },
};

export interface DbPageRow {
  slug: string;
  data: string;
  is_custom: 0 | 1;
  updated_at: number;
  updated_by: string | null;
}

export const Pages = {
  get(slug: string): DbPageRow | undefined {
    return db.prepare("SELECT * FROM pages WHERE slug = ?").get(slug) as DbPageRow | undefined;
  },
  upsert(slug: string, data: unknown, isCustom: boolean, updatedBy: string): void {
    const row = Pages.get(slug);
    const now = Date.now();
    const json = JSON.stringify(data);
    if (row) {
      db.prepare("UPDATE pages SET data=?, updated_at=?, updated_by=? WHERE slug=?").run(
        json, now, updatedBy, slug
      );
    } else {
      db.prepare(
        "INSERT INTO pages(slug, data, is_custom, updated_at, updated_by) VALUES (?,?,?,?,?)"
      ).run(slug, json, isCustom ? 1 : 0, now, updatedBy);
    }
  },
  delete(slug: string): void {
    db.prepare("DELETE FROM pages WHERE slug=?").run(slug);
  },
  hideStatic(slug: string, hiddenBy: string): void {
    db.prepare(
      "INSERT INTO hidden_pages(slug, hidden_at, hidden_by) VALUES (?,?,?) ON CONFLICT(slug) DO UPDATE SET hidden_at=excluded.hidden_at, hidden_by=excluded.hidden_by"
    ).run(slug, Date.now(), hiddenBy);
  },
  unhideStatic(slug: string): void {
    db.prepare("DELETE FROM hidden_pages WHERE slug=?").run(slug);
  },
  isHidden(slug: string): boolean {
    const row = db.prepare("SELECT slug FROM hidden_pages WHERE slug=?").get(slug);
    return Boolean(row);
  },
  allCustom(): DbPageRow[] {
    return db
      .prepare("SELECT * FROM pages WHERE is_custom=1 ORDER BY updated_at DESC")
      .all() as DbPageRow[];
  },
  byCategory(category: string): DbPageRow[] {
    // Fall back to scanning since data is JSON.
    const rows = db.prepare("SELECT * FROM pages WHERE is_custom=1").all() as DbPageRow[];
    return rows.filter((r) => {
      try {
        const d = JSON.parse(r.data);
        return (d.category || "").toLowerCase() === category.toLowerCase();
      } catch {
        return false;
      }
    });
  },
};
