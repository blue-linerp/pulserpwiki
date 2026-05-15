// Steam OpenID 2.0 helpers (no external dependencies).

export function siteUrl(): string {
  return (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export function buildSteamLoginUrl(): string {
  const realm = siteUrl();
  const returnTo = `${realm}/api/auth/steam/return`;
  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": returnTo,
    "openid.realm": realm,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
  });
  return `https://steamcommunity.com/openid/login?${params.toString()}`;
}

/**
 * Verify the OpenID response by re-posting it to Steam with mode=check_authentication.
 * Returns the SteamID64 string on success, or null on failure.
 */
export async function verifySteamOpenId(
  searchParams: URLSearchParams
): Promise<string | null> {
  const params = new URLSearchParams();
  for (const [k, v] of searchParams.entries()) params.append(k, v);
  params.set("openid.mode", "check_authentication");

  const res = await fetch("https://steamcommunity.com/openid/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  const text = await res.text();
  if (!/is_valid\s*:\s*true/i.test(text)) return null;

  const claimedId = searchParams.get("openid.claimed_id") || "";
  const m = claimedId.match(/^https?:\/\/steamcommunity\.com\/openid\/id\/(\d+)$/);
  return m ? m[1] : null;
}

export interface SteamProfile {
  steamid: string;
  personaname: string;
  avatarfull: string;
  profileurl: string;
}

export async function fetchSteamProfile(steamId: string): Promise<SteamProfile | null> {
  const key = process.env.STEAM_API_KEY;
  if (!key) return null;
  const url = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=${encodeURIComponent(
    key
  )}&steamids=${encodeURIComponent(steamId)}`;
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { response?: { players?: SteamProfile[] } };
    return data.response?.players?.[0] ?? null;
  } catch {
    return null;
  }
}
