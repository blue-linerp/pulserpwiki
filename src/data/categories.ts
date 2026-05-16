import type { LucideIcon } from "lucide-react";

export interface Category {
  slug: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  imageUrl?: string;
  href: string;
  accent?: string;
}

const BASE = "https://g7dthgxknzfzgaxy.public.blob.vercel-storage.com";

export const categories: Category[] = [
  { slug: "characters", title: "Characters", description: "Player-driven personas, biographies, and storylines.", imageUrl: `${BASE}/Characters.png`, href: "/wiki/characters" },
  { slug: "law-enforcement", title: "Law Enforcement", description: "Law enforcement agencies operating across San Andreas.", imageUrl: `${BASE}/LawEnforcement.png`, href: "/wiki/police" },
  { slug: "medical", title: "Medical", description: "EMS, paramedics, and Pillbox Medical Center operations.", imageUrl: `${BASE}/EMS_Logo.png`, href: "/wiki/ems-medical" },
  { slug: "government", title: "Government", description: "City Hall, the DOJ, and state-level administration.", imageUrl: `${BASE}/Government.png`, href: "/wiki/department-of-justice" },
  { slug: "groups", title: "Criminal Activities", description: "Gangs, MCs, civilian organizations, and crews.", imageUrl: `${BASE}/CriminalActivity.png`, href: "/wiki/criminal-activities" },
  { slug: "businesses", title: "Businesses", description: "Legal storefronts, services, and player-run companies.", imageUrl: `${BASE}/Businesses-1UNwlplalaWWDxbw0TNDNbLEFHXtV8.png`, href: "/wiki/businesses" },
  { slug: "activities", title: "Activities", description: "Heists, jobs, side missions, and city events.", imageUrl: `${BASE}/CriminalActivity.png`, href: "/wiki/criminal-activities" },
  { slug: "weapons", title: "Weapons", description: "Firearms, melee, attachments, and licensing.", imageUrl: `${BASE}/Weapons.png`, href: "/wiki/weapons" },
  { slug: "vehicles", title: "Vehicles", description: "Civilian, emergency, and custom vehicles in Pulse RP.", imageUrl: `${BASE}/Vehicles.png`, href: "/wiki/vehicles" },
  { slug: "housing", title: "Housing", description: "Apartments, properties, and the housing system.", imageUrl: `${BASE}/HousingSystem.png`, href: "/wiki/housing-system" },
  { slug: "jobs", title: "Jobs", description: "Civilian employment and whitelisted careers.", imageUrl: `${BASE}/CivilianJobs.png`, href: "/wiki/civilian-jobs" },
  { slug: "rules", title: "Rules", description: "Server rules, conduct, and roleplay standards.", imageUrl: `${BASE}/Rules-PrJF9cJOh92aj71eUY0ZQEpPmnuw9Z.png`, href: "/wiki/server-rules" },
];
