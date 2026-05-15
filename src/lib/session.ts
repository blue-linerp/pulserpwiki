import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "pulse_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getSecret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error("SESSION_SECRET is not set or too short (>=16 chars).");
  }
  return s;
}

function b64url(buf: Buffer): string {
  return buf.toString("base64").replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function fromB64url(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function sign(payload: string): string {
  return b64url(crypto.createHmac("sha256", getSecret()).update(payload).digest());
}

export interface SessionData {
  steam_id: string;
  persona?: string | null;
  avatar?: string | null;
  profile_url?: string | null;
  role?: "admin" | "user";
  iat: number;
}

export function encodeSession(data: SessionData): string {
  const json = JSON.stringify(data);
  const payload = b64url(Buffer.from(json, "utf8"));
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(token: string | undefined): SessionData | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return null;
  if (!crypto.timingSafeEqual(new Uint8Array(a), new Uint8Array(b))) return null;
  try {
    const data = JSON.parse(fromB64url(payload).toString("utf8")) as SessionData;
    if (Date.now() / 1000 - data.iat > MAX_AGE) return null;
    return data;
  } catch {
    return null;
  }
}

export function getSessionCookie(): SessionData | null {
  const c = cookies().get(COOKIE_NAME)?.value;
  return decodeSession(c);
}

export function buildSetCookie(token: string): string {
  const attrs = [
    `${COOKIE_NAME}=${token}`,
    "Path=/",
    `Max-Age=${MAX_AGE}`,
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (process.env.NODE_ENV === "production") attrs.push("Secure");
  return attrs.join("; ");
}

export function buildClearCookie(): string {
  return `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`;
}

export const SESSION_COOKIE = COOKIE_NAME;
