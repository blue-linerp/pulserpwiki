/**
 * LSPD Rank insignia map.
 * Keys match the shortcodes used in wiki content via {{LSPDRank|key}}.
 * imageUrl points to the uploaded insignia file in your blob storage.
 */

const BASE = "https://g7dthgxknzfzgaxy.public.blob.vercel-storage.com";

export interface LSPDRank {
  label: string;
  aliases: string[];
  imageUrl: string;
  width?: number;
}

export const LSPD_RANKS: Record<string, LSPDRank> = {
  cop: {
    label: "Chief of Police",
    aliases: ["chief"],
    imageUrl: `${BASE}/4 silver stars.svg`,
    width: 15,
  },
  acop: {
    label: "Assistant Chief of Police",
    aliases: ["assistantchief"],
    imageUrl: `${BASE}/3 silver stars.svg`,
    width: 15,
  },
  dchief: {
    label: "Deputy Chief",
    aliases: ["deputychief", "dcop"],
    imageUrl: `${BASE}/2 silver stars.svg`,
    width: 15,
  },
  comm: {
    label: "Commander",
    aliases: ["commander"],
    imageUrl: `${BASE}/1_silver_star.svg`,
    width: 20,
  },
  cpt: {
    label: "Captain",
    aliases: ["captain"],
    imageUrl: `${BASE}/3- POLICE Captain.svg`,
    width: 25,
  },
  lt: {
    label: "Lieutenant",
    aliases: ["lieutenant"],
    imageUrl: `${BASE}/4- POLICE Lieutenant.svg`,
    width: 25,
  },
  fsgt: {
    label: "First Sergeant",
    aliases: ["firstsergeant"],
    imageUrl: `${BASE}/LSPD First Sergeant.svg`,
    width: 25,
  },
  sgt: {
    label: "Sergeant",
    aliases: ["sergeant"],
    imageUrl: `${BASE}/6- POLICE Sergeant.svg`,
    width: 25,
  },
  cpl: {
    label: "Corporal",
    aliases: ["corporal"],
    imageUrl: `${BASE}/LSPD Corporal.svg`,
    width: 25,
  },
  snr: {
    label: "Senior Officer",
    aliases: ["senior"],
    imageUrl: `${BASE}/LSPD Senior Officer.svg`,
    width: 30,
  },
  off: {
    label: "Officer",
    aliases: ["officer"],
    imageUrl: `${BASE}/LSPD Officer.svg`,
    width: 25,
  },
  psd: {
    label: "Probationary Officer",
    aliases: ["probationary"],
    imageUrl: `${BASE}/Cadet-Probationary Officer.png`,
    width: 25,
  },
  cdt: {
    label: "Cadet",
    aliases: ["cadet"],
    imageUrl: `${BASE}/Caution Cadet.png`,
    width: 25,
  },
};

/** Build a flat alias→key lookup so {{LSPDRank|sergeant}} resolves to "sgt" */
export const LSPD_RANK_ALIAS_MAP: Record<string, string> = Object.entries(LSPD_RANKS).reduce(
  (acc, [key, rank]) => {
    acc[key] = key;
    for (const alias of rank.aliases) acc[alias] = key;
    return acc;
  },
  {} as Record<string, string>
);

export function resolveLspdRank(code: string): LSPDRank | undefined {
  const key = LSPD_RANK_ALIAS_MAP[code.toLowerCase()];
  return key ? LSPD_RANKS[key] : undefined;
}