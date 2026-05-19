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
      { label: "Map: Los Santos", href: "/wiki/map" },
      { label: "Recent Changes", href: "/wiki/recent-changes" },
      { label: "Community", href: "/wiki/community" },
    ],
  },
  {
    title: "Directories",
    defaultOpen: true,
    links: [
      { label: "Characters", href: "/wiki/Category:Characters" },
      { label: "Law Enforcement", href: "/wiki/Category:Police" },
      { label: "Departments / Government", href: "/wiki/Category:Departments" },
      { label: "Businesses", href: "/wiki/Category:Businesses" },
      { label: "Locations", href: "/wiki/Category:Locations" },
      { label: "Vehicles", href: "/wiki/Category:Vehicles" },
      { label: "Weapons", href: "/wiki/Category:Weapons" },
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
      { label: "Getting Started", href: "/wiki/getting-started" },
      { label: "How to Join", href: "/wiki/how-to-join" },
      { label: "Application Process", href: "/wiki/application-process" },
      { label: "Character Creation", href: "/wiki/character-creation" },
      { label: "Server Rules", href: "/wiki/server-rules" },
      { label: "Phone System", href: "/wiki/phone-system" },
      { label: "Housing System", href: "/wiki/housing-system" },
      { label: "Banking & Economy", href: "/wiki/banking-system" },
      { label: "Civilian Jobs", href: "/wiki/civilian-jobs" },
      { label: "Criminal Activities", href: "/wiki/criminal-activities" },
    ],
  },
];