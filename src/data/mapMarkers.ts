// Pulse RP — Los Santos map marker data.
//
// Coordinates are expressed in the Leaflet CRS.Simple space used by the
// GTA V atlas tile set (meesvrh/GTAV-Map-Tiles). At zoom 0 the entire
// atlas is a single 256x256 tile, so we describe markers in that
// 0-256 range. The map renderer flips Y so that (0,0) is the TOP-LEFT
// of the atlas image (north-west), matching how players think about
// the in-game atlas.
//
// TIP: positions below are best-effort approximations. To dial in a
// marker precisely, open /wiki/map, click "Pick coordinates" in the
// sidebar, click the spot on the map, and paste the result here.

export type MapMarkerCategory =
  | "police"
  | "ems"
  | "government"
  | "business"
  | "criminal"
  | "landmark"
  | "transport";

export interface MapMarker {
  id: string;
  name: string;
  category: MapMarkerCategory;
  /** 0..256 from the left edge of the atlas */
  x: number;
  /** 0..256 from the TOP edge of the atlas */
  y: number;
  description?: string;
  href?: string;
}

export const mapCategories: { id: MapMarkerCategory; label: string; color: string }[] = [
  { id: "police",     label: "Police Departments", color: "#2563eb" },
  { id: "ems",        label: "EMS / Medical",      color: "#22c55e" },
  { id: "government", label: "Government",         color: "#a855f7" },
  { id: "business",   label: "Businesses",         color: "#f59e0b" },
  { id: "criminal",   label: "Criminal Activity",  color: "#dc2626" },
  { id: "landmark",   label: "Landmarks",          color: "#e5e7eb" },
  { id: "transport",  label: "Transport",          color: "#06b6d4" },
];

export const mapMarkers: MapMarker[] = [
  // --- Police ---
  {
    id: "mission-row-pd",
    name: "Mission Row Police Department",
    category: "police",
    x: 126.7, y: 192.93,
    description: "LSPD headquarters in downtown Los Santos.",
    href: "/wiki/los-santos-police-department",
  },
  {
    id: "vespucci-pd",
    name: "Vespucci Police Station",
    category: "police",
    x: 89.7, y: 203,
  },
  {
    id: "sandy-shores-sheriff",
    name: "Sandy Shores Sheriff's Office",
    category: "police",
    x: 171.7, y: 103,
  },
  {
    id: "paleto-sheriff",
    name: "Paleto Bay Sheriff's Office",
    category: "police",
    x: 131.7, y: 53,
  },

  // --- EMS / Medical ---
  {
    id: "pillbox-medical",
    name: "Pillbox Hill Medical Center",
    category: "ems",
    x: 121.7, y: 195,
    href: "/wiki/ems-medical",
  },
  {
    id: "st-fiacre",
    name: "St. Fiacre Medical Center",
    category: "ems",
    x: 133.7, y: 183,
    href: "/wiki/st-fiacre",
  },
  {
    id: "sandy-medical",
    name: "Sandy Shores Medical Center",
    category: "ems",
    x: 168.7, y: 105,
  },

  // --- Government / Justice ---
  {
    id: "city-hall",
    name: "Los Santos City Hall",
    category: "government",
    x: 123.7, y: 197,
    href: "/wiki/government",
  },
  {
    id: "doj-courthouse",
    name: "Los Santos Courthouse",
    category: "government",
    x: 125.7, y: 195,
    href: "/wiki/department-of-justice",
  },

  // --- Businesses ---
  {
    id: "maze-bank-tower",
    name: "Maze Bank Tower",
    category: "business",
    x: 123.7, y: 193,
    href: "/wiki/businesses",
  },
  {
    id: "vanilla-unicorn",
    name: "Vanilla Unicorn",
    category: "business",
    x: 130.7, y: 213,
  },
  {
    id: "bahama-mamas",
    name: "Bahama Mamas",
    category: "business",
    x: 138.7, y: 187,
  },
  {
    id: "tequi-la-la",
    name: "Tequi-la-la",
    category: "business",
    x: 115.7, y: 173,
  },

  // --- Criminal ---
  {
    id: "lost-mc-clubhouse",
    name: "Lost MC Clubhouse",
    category: "criminal",
    x: 171.7, y: 120,
    href: "/wiki/criminal-activities",
  },
  {
    id: "grove-street",
    name: "Grove Street",
    category: "criminal",
    x: 125.7, y: 220,
  },
  {
    id: "humane-labs",
    name: "Humane Labs",
    category: "criminal",
    x: 213.7, y: 95,
  },

  // --- Landmarks ---
  {
    id: "vinewood-sign",
    name: "Vinewood Sign",
    category: "landmark",
    x: 131.7, y: 155,
  },
  {
    id: "mt-chiliad",
    name: "Mount Chiliad",
    category: "landmark",
    x: 155.7, y: 57,
  },
  {
    id: "del-perro-pier",
    name: "Del Perro Pier",
    category: "landmark",
    x: 78.7, y: 193,
  },
  {
    id: "vespucci-beach",
    name: "Vespucci Beach",
    category: "landmark",
    x: 85.7, y: 205,
  },
  {
    id: "fort-zancudo",
    name: "Fort Zancudo",
    category: "landmark",
    x: 88.7, y: 140,
  },

  // --- Transport ---
  {
    id: "lsia",
    name: "Los Santos International Airport",
    category: "transport",
    x: 108.7, y: 233,
  },
  {
    id: "sandy-airfield",
    name: "Sandy Shores Airfield",
    category: "transport",
    x: 178.7, y: 110,
  },
  {
    id: "del-perro-heliport",
    name: "Maze Bank Heliport",
    category: "transport",
    x: 113.7, y: 200,
  },
];
