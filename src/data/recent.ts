export interface RecentChange {
  title: string;
  href: string;
  editor: string;
  when: string;
  summary: string;
}

export const recentChanges: RecentChange[] = [
  { title: "Department of Justice", href: "/wiki/department-of-justice", editor: "PulseStaff", when: "2h ago", summary: "Updated leadership and judicial officers." },
  { title: "Phone System", href: "/wiki/phone-system", editor: "DevTeam", when: "5h ago", summary: "Added Business Apps section." },
  { title: "Criminal Activities", href: "/wiki/criminal-activities", editor: "LoreTeam", when: "1d ago", summary: "Reworked heist categories and payouts." },
  { title: "Housing System", href: "/wiki/housing-system", editor: "PulseStaff", when: "2d ago", summary: "Added shell types and storage info." },
  { title: "Application Process", href: "/wiki/application-process", editor: "Admin", when: "3d ago", summary: "Clarified whitelist interview steps." },
  { title: "Vehicles", href: "/wiki/vehicles", editor: "Garage", when: "4d ago", summary: "Added new emergency liveries." },
];
