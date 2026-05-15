import {
  Users, Shield, Stethoscope, Landmark, UsersRound, Building2,
  Activity, Crosshair, Car, Home, Briefcase, ScrollText,
  type LucideIcon,
} from "lucide-react";

export interface Category {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  accent?: string;
}

export const categories: Category[] = [
  { slug: "characters", title: "Characters", description: "Player-driven personas, biographies, and storylines.", icon: Users, href: "/wiki/characters" },
  { slug: "police", title: "Police", description: "Law enforcement agencies operating across San Andreas.", icon: Shield, href: "/wiki/departments" },
  { slug: "medical", title: "Medical", description: "EMS, paramedics, and Pillbox Medical Center operations.", icon: Stethoscope, href: "/wiki/ems-medical" },
  { slug: "government", title: "Government", description: "City Hall, the DOJ, and state-level administration.", icon: Landmark, href: "/wiki/department-of-justice" },
  { slug: "groups", title: "Groups", description: "Gangs, MCs, civilian organizations, and crews.", icon: UsersRound, href: "/wiki/criminal-activities" },
  { slug: "businesses", title: "Businesses", description: "Legal storefronts, services, and player-run companies.", icon: Building2, href: "/wiki/businesses" },
  { slug: "activities", title: "Activities", description: "Heists, jobs, side missions, and city events.", icon: Activity, href: "/wiki/criminal-activities" },
  { slug: "weapons", title: "Weapons", description: "Firearms, melee, attachments, and licensing.", icon: Crosshair, href: "/wiki/weapons" },
  { slug: "vehicles", title: "Vehicles", description: "Civilian, emergency, and custom vehicles in Pulse RP.", icon: Car, href: "/wiki/vehicles" },
  { slug: "housing", title: "Housing", description: "Apartments, properties, and the housing system.", icon: Home, href: "/wiki/housing-system" },
  { slug: "jobs", title: "Jobs", description: "Civilian employment and whitelisted careers.", icon: Briefcase, href: "/wiki/civilian-jobs" },
  { slug: "rules", title: "Rules", description: "Server rules, conduct, and roleplay standards.", icon: ScrollText, href: "/wiki/server-rules" },
];
