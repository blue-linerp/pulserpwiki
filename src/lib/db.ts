import { createClient, type Client } from "@libsql/client";

declare global {
  // eslint-disable-next-line no-var
  var __pulse_db: Client | undefined;
}

function makeClient(): Client {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error("TURSO_DATABASE_URL is not set.");
  if (!authToken && process.env.NODE_ENV !== "production") {
    return createClient({ url: "file:data/wiki.db" });
  }
  return createClient({ url, authToken });
}

export const db: Client =
  global.__pulse_db ??
  (() => {
    const client = makeClient();
    if (process.env.NODE_ENV !== "production") global.__pulse_db = client;
    return client;
  })();

let schemaReady = false;

export async function ensureSchema(): Promise<void> {
  if (schemaReady) return;
  await db.executeMultiple(`
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
      updated_by TEXT,
      summary    TEXT
    );
    CREATE TABLE IF NOT EXISTS hidden_pages (
      slug       TEXT PRIMARY KEY,
      hidden_at  INTEGER NOT NULL,
      hidden_by  TEXT
    );
  `);
  // Add summary column if upgrading from older schema
  try {
    await db.execute("ALTER TABLE pages ADD COLUMN summary TEXT");
  } catch {
    // Column already exists — ignore
  }
  schemaReady = true;
}

export interface DbUser {
  steam_id: string;
  persona: string | null;
  avatar: string | null;
  profile_url: string | null;
  role: "admin" | "user";
  created_at: number;
}

export interface DbPageRow {
  slug: string;
  data: string;
  is_custom: 0 | 1;
  updated_at: number;
  updated_by: string | null;
  summary: string | null;
}

export interface DbHiddenRow {
  slug: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToUser(row: any): DbUser {
  return {
    steam_id: String(row.steam_id),
    persona: row.persona != null ? String(row.persona) : null,
    avatar: row.avatar != null ? String(row.avatar) : null,
    profile_url: row.profile_url != null ? String(row.profile_url) : null,
    role: String(row.role) as "admin" | "user",
    created_at: Number(row.created_at),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToPage(row: any): DbPageRow {
  return {
    slug: String(row.slug),
    data: String(row.data),
    is_custom: Number(row.is_custom) as 0 | 1,
    updated_at: Number(row.updated_at),
    updated_by: row.updated_by != null ? String(row.updated_by) : null,
    summary: row.summary != null ? String(row.summary) : null,
  };
}

export const Users = {
  async count(): Promise<number> {
    await ensureSchema();
    const r = await db.execute("SELECT COUNT(*) as c FROM users");
    return Number(r.rows[0]?.c ?? 0);
  },
  async get(steamId: string): Promise<DbUser | undefined> {
    await ensureSchema();
    const r = await db.execute({ sql: "SELECT * FROM users WHERE steam_id = ?", args: [steamId] });
    return r.rows[0] ? rowToUser(r.rows[0]) : undefined;
  },
  async all(): Promise<DbUser[]> {
    await ensureSchema();
    const r = await db.execute("SELECT * FROM users ORDER BY created_at DESC");
    return r.rows.map(rowToUser);
  },
  async setRole(steamId: string, role: "admin" | "user"): Promise<DbUser | undefined> {
    await ensureSchema();
    await db.execute({ sql: "UPDATE users SET role=? WHERE steam_id=?", args: [role, steamId] });
    return Users.get(steamId);
  },
  async upsert(u: Omit<DbUser, "created_at"> & { created_at?: number }): Promise<DbUser> {
    await ensureSchema();
    const existing = await Users.get(u.steam_id);
    if (existing) {
      await db.execute({
        sql: "UPDATE users SET persona=?, avatar=?, profile_url=? WHERE steam_id=?",
        args: [u.persona, u.avatar, u.profile_url, u.steam_id],
      });
      return (await Users.get(u.steam_id))!;
    }
    const role: "admin" | "user" = (await Users.count()) === 0 ? "admin" : u.role || "user";
    const created_at = Date.now();
    await db.execute({
      sql: "INSERT INTO users(steam_id, persona, avatar, profile_url, role, created_at) VALUES (?,?,?,?,?,?)",
      args: [u.steam_id, u.persona, u.avatar, u.profile_url, role, created_at],
    });
    return (await Users.get(u.steam_id))!;
  },
};

export const Pages = {
  async get(slug: string): Promise<DbPageRow | undefined> {
    await ensureSchema();
    const r = await db.execute({ sql: "SELECT * FROM pages WHERE slug = ?", args: [slug] });
    return r.rows[0] ? rowToPage(r.rows[0]) : undefined;
  },
  async allRows(): Promise<DbPageRow[]> {
    await ensureSchema();
    const r = await db.execute("SELECT * FROM pages");
    return r.rows.map(rowToPage);
  },
  async allHidden(): Promise<DbHiddenRow[]> {
    await ensureSchema();
    const r = await db.execute("SELECT slug FROM hidden_pages");
    return r.rows.map((row) => ({ slug: String(row.slug) }));
  },
  async upsert(slug: string, data: unknown, isCustom: boolean, updatedBy: string, summary?: string): Promise<void> {
    await ensureSchema();
    const row = await Pages.get(slug);
    const now = Date.now();
    const json = JSON.stringify(data);
    if (row) {
      await db.execute({
        sql: "UPDATE pages SET data=?, updated_at=?, updated_by=?, summary=? WHERE slug=?",
        args: [json, now, updatedBy, summary ?? null, slug],
      });
    } else {
      await db.execute({
        sql: "INSERT INTO pages(slug, data, is_custom, updated_at, updated_by, summary) VALUES (?,?,?,?,?,?)",
        args: [slug, json, isCustom ? 1 : 0, now, updatedBy, summary ?? null],
      });
    }
  },
  async delete(slug: string): Promise<void> {
    await ensureSchema();
    await db.execute({ sql: "DELETE FROM pages WHERE slug=?", args: [slug] });
  },
  async hideStatic(slug: string, hiddenBy: string): Promise<void> {
    await ensureSchema();
    await db.execute({
      sql: `INSERT INTO hidden_pages(slug, hidden_at, hidden_by) VALUES (?,?,?)
            ON CONFLICT(slug) DO UPDATE SET hidden_at=excluded.hidden_at, hidden_by=excluded.hidden_by`,
      args: [slug, Date.now(), hiddenBy],
    });
  },
  async unhideStatic(slug: string): Promise<void> {
    await ensureSchema();
    await db.execute({ sql: "DELETE FROM hidden_pages WHERE slug=?", args: [slug] });
  },
  async isHidden(slug: string): Promise<boolean> {
    await ensureSchema();
    const r = await db.execute({ sql: "SELECT slug FROM hidden_pages WHERE slug=?", args: [slug] });
    return r.rows.length > 0;
  },
  async allCustom(): Promise<DbPageRow[]> {
    await ensureSchema();
    const r = await db.execute("SELECT * FROM pages WHERE is_custom=1 ORDER BY updated_at DESC");
    return r.rows.map(rowToPage);
  },
  async byCategory(category: string): Promise<DbPageRow[]> {
    await ensureSchema();
    const r = await db.execute("SELECT * FROM pages WHERE is_custom=1");
    return r.rows.map(rowToPage).filter((row) => {
      try {
        const d = JSON.parse(row.data);
        return (d.category || "").toLowerCase() === category.toLowerCase();
      } catch { return false; }
    });
  },
};