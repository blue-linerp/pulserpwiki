export interface SidebarLink {
  label: string;
  href: string;
}
export interface SidebarGroup {
  title: string;
  links: SidebarLink[];
  defaultOpen?: boolean;
}

export const sidebarGroups: SidebarGroup[] = [
  {
    title: "Explore",
    defaultOpen: true,
    links: [
      { label: "Main Page", href: "/" },
      { label: "All Pages", href: "/wiki/all-pages" },
      { label: "Recent Changes", href: "/wiki/recent-changes" },
      { label: "Community", href: "/wiki/community" },
      { label: "Server Rules", href: "/wiki/server-rules" },
      { label: "Getting Started", href: "/wiki/getting-started" },
    ],
  },
  {
    title: "Wiki Content",
    defaultOpen: true,
    links: [
      { label: "Departments", href: "/wiki/departments" },
      { label: "Businesses", href: "/wiki/businesses" },
      { label: "Civilian Jobs", href: "/wiki/civilian-jobs" },
      { label: "Criminal Activities", href: "/wiki/criminal-activities" },
      { label: "Characters", href: "/wiki/characters" },
      { label: "Locations", href: "/wiki/locations" },
      { label: "Vehicles", href: "/wiki/vehicles" },
      { label: "Weapons", href: "/wiki/weapons" },
      { label: "Server Systems", href: "/wiki/phone-system" },
    ],
  },
  {
    title: "Departments",
    links: [
      { label: "All Departments", href: "/wiki/departments" },
      { label: "EMS / Medical", href: "/wiki/ems-medical" },
      { label: "Department of Justice", href: "/wiki/department-of-justice" },
      { label: "Government", href: "/wiki/government" },
      { label: "Los Santos Police Department", href: "/wiki/los-santos-police-department" },
    ],
  },
  {
    title: "Guides",
    links: [
      { label: "How to Join", href: "/wiki/how-to-join" },
      { label: "Application Process", href: "/wiki/application-process" },
      { label: "Character Creation", href: "/wiki/character-creation" },
      { label: "New Player Guide", href: "/wiki/getting-started" },
      { label: "Economy Guide", href: "/wiki/banking-system" },
      { label: "Phone System", href: "/wiki/phone-system" },
      { label: "Housing System", href: "/wiki/housing-system" },
      { label: "Business Guide", href: "/wiki/businesses" },
      { label: "Law Enforcement Guide", href: "/wiki/departments" },
      { label: "Criminal Guide", href: "/wiki/criminal-activities" },
    ],
  },
];
