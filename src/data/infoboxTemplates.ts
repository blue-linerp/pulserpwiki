import type { InfoboxField } from "./types";
import { CHARACTER_TEMPLATE, templateFieldLabel, templateFieldSource, type TemplateGroup } from "./characterTemplate";

export { templateFieldLabel, templateFieldSource } from "./characterTemplate";

export type InfoboxTemplateKey = "character" | "business" | "department" | "lspd" | "bcso" | "doj" | "ems" | "site" | "neighborhood";

const range = (prefix: string, n: number) =>
  Array.from({ length: n }, (_, i) => `${prefix} ${i + 1}`);

const numberedFields = (label: string, sourcePrefix: string, n: number) =>
  Array.from({ length: n }, (_, i) => ({ label, source: `${sourcePrefix}${i + 1}` }));

export const BUSINESS_TEMPLATE: TemplateGroup[] = [
  {
    heading: "Business Information",
    fields: [
      { label: "Status", source: "status" },
      { label: "Server", source: "server" },
      { label: "Aliases", source: "aliases" },
      { label: "Website", source: "website" },
      { label: "Founded", source: "founded" },
      { label: "Founder", source: "founder" },
      { label: "Owner(s)", source: "owner" },
      { label: "CEO", source: "ceo" },
      { label: "CFO", source: "cfo" },
      { label: "COO", source: "coo" },
      { label: "CMO", source: "cmo" },
      { label: "CDO", source: "cdo" },
      { label: "CBO", source: "cbo" },
      { label: "CPO", source: "cpo" },
      { label: "Executives", source: "executives" },
      { label: "Family", source: "family" },
    ],
  },
  {
    heading: "Business Details",
    fields: [
      { label: "Holding Company", source: "holding_company" },
      { label: "Business Type", source: "business_type" },
      { label: "Location", source: "location" },
      { label: "Net Worth", source: "net_worth" },
      { label: "Partners", source: "partners" },
      { label: "Legal", source: "legal" },
      { label: "Investor", source: "investor" },
      { label: "Affiliation", source: "affiliation" },
      { label: "Enemies", source: "enemies" },
    ],
  },
  {
    heading: "Staff",
    fields: [
      { label: "Management", source: "management" },
      { label: "Producer", source: "producer" },
      { label: "Marketing", source: "marketing" },
      { label: "Security", source: "security" },
      { label: "Artists", source: "artists" },
      { label: "Intern Artists", source: "intern_artists" },
    ],
  },
];

export const SITE_TEMPLATE: TemplateGroup[] = [
  {
    heading: "",
    fields: [
      { label: "Type", source: "type" },
      { label: "Platform", source: "platform" },
      { label: "Framework", source: "framework" },
      { label: "Genre", source: "genre" },
      { label: "Map", source: "map" },
      { label: "Status", source: "status" },
    ],
  },
  {
    heading: "Community",
    fields: [
      { label: "Founded", source: "founded" },
      { label: "Owner", source: "owner" },
      { label: "Community Manager", source: "communityManager" },
      { label: "Community Size", source: "communitySize" },
      { label: "Website", source: "website" },
      { label: "Discord", source: "discord" },
      { label: "Forums", source: "forums" },
    ],
  },
  {
    heading: "Server",
    fields: [
      { label: "Max Players", source: "maxPlayers" },
      { label: "Restart Schedule", source: "restartSchedule" },
      { label: "Whitelist", source: "whitelist" },
      { label: "Minimum Age", source: "minimumAge" },
    ],
  },
];

export const DOJ_TEMPLATE: TemplateGroup[] = [
  { heading: "", fields: [{ label: "Status", source: "status" }] },
  {
    heading: "Business Information",
    fields: [
      { label: "Business Type", source: "business_type" },
      { label: "Business Partners", source: "partners" },
      { label: "Location", source: "location" },
    ],
  },
  {
    heading: "Office of the Chief Justice",
    fields: [
      { label: "Chief Justice", source: "chief_justice" },
      { label: "Deputy Chief Justice", source: "deputy_chief_justice_1" },
      { label: "Deputy Chief Justice", source: "deputy_chief_justice_2" },
      { label: "Deputy Chief Justice", source: "deputy_chief_justice_3" },
    ],
  },
  { heading: "Judges", fields: numberedFields("Judge", "judge_", 15) },
  { heading: "Special Prosecutors", fields: numberedFields("Special Prosecutor", "special_prosecutor_", 5) },
  {
    heading: "Clerks",
    fields: [
      { label: "Head Clerk", source: "head_clerk_1" },
      { label: "Head Clerk", source: "head_clerk_2" },
      ...numberedFields("Court of Justice", "coj_clerk_", 5),
      ...numberedFields("Court of Civil Equity", "coce_clerk_", 5),
      ...numberedFields("Court of Review", "cor_clerk_", 5),
    ],
  },
  { heading: "Lawyers", fields: numberedFields("Lawyer", "lawyer_", 25) },
  { heading: "Paralegals", fields: numberedFields("Paralegal", "paralegal_", 5) },
];

export const EMS_TEMPLATE: TemplateGroup[] = [
  {
    heading: "Agency Information",
    fields: [
      { label: "Status", source: "status" },
      { label: "Agency Type", source: "agency_type" },
      { label: "Agency Executive", source: "agency_executive" },
      { label: "Date Formed", source: "date_formed" },
      { label: "Date Disbanded", source: "date_disbanded" },
      { label: "Partners", source: "partners" },
      { label: "Affiliations", source: "affiliations" },
      { label: "Predecessors", source: "predecessors" },
      { label: "Successors", source: "successors" },
      { label: "Location", source: "location" },
    ],
  },
  {
    heading: "Los santos Medical center",
    fields: [{ label: "Medical Director", source: "Medical Director" }],
  },
  {
    heading: "High Command",
    fields: [
      { label: "Chief", source: "ems_chief" },
      { label: "Deputy Chief", source: "ems_deputy_chief_1" },
      { label: "Deputy Chief", source: "ems_deputy_chief_2" },
      { label: "Deputy Chief", source: "ems_deputy_chief_3" },
      { label: "Deputy Chief", source: "ems_deputy_chief_4" },
      { label: "Deputy Chief", source: "ems_deputy_chief_5" },
    ],
  },
  { heading: "Head Paramedics", fields: numberedFields("Head Paramedic", "Head_Paramedic_", 5) },
  { heading: "Senior Paramedics", fields: numberedFields("Senior Paramedic", "Senior_Paramedic_", 10) },
  { heading: "Paramedics", fields: numberedFields("Paramedic", "Paramedics_", 20) },
  {
    heading: "Senior Emergency Medical Technicians",
    fields: numberedFields("Senior EMT", "S_EMT_", 20),
  },
  { heading: "Emergency Medical Technicians", fields: numberedFields("EMT", "EMT_", 20) },
  { heading: "Emergency Medical Responders", fields: numberedFields("EMR", "EMR_", 10) },
];

export interface InfoboxTemplateDefinition {
  key: InfoboxTemplateKey;
  label: string;
  groups: TemplateGroup[];
}

export const DEPARTMENT_TEMPLATE: TemplateGroup[] = [
  {
    heading: "",
    fields: ["Status", "Agency Type", "Governing Body", "Agency Executive", "Date Formed", "Partners", "Headquarters"],
  },
  {
    heading: "Commissioner's Office",
    fields: ["Commissioner", "Deputy Commissioner 1", "Deputy Commissioner 2"],
  },
  {
    heading: "Executive Command",
    fields: ["Chief of Police", "Assistant Chief of Police", "Deputy Chief"],
  },
  {
    heading: "Command",
    fields: ["Commander", "Captain 1", "Captain 2"],
  },
  {
    heading: "Lieutenants",
    fields: ["Lieutenant 1", "Lieutenant 2"],
  },
  {
    heading: "NCOs",
    fields: ["Sergeant 1", "Sergeant 2", "Corporal 1", "Corporal 2"],
  },
  {
    heading: "Law Enforcement Officers",
    fields: ["Senior Officer 1", "Senior Officer 2", "Officer 1", "Officer 2", "Probationary Officer 1", "Probationary Officer 2"],
  },
  {
    heading: "Department Information",
    fields: [
      "Full Name",
      "Abbreviation",
      "Motto",
      "Founded",
      "Founder",
      "Headquarters",
      "Service Area",
      "Governing Body",
    ],
  },
];

export const LSPD_TEMPLATE: TemplateGroup[] = [
  {
    heading: "Department Information",
    fields: [
      { label: "Status", source: "status" },
      { label: "Agency Type", source: "agency_type" },
      { label: "Governing Body", source: "Governing Body" },
      { label: "Agency Executive", source: "agency_executive" },
      { label: "Date Formed", source: "date_formed" },
      { label: "Date Disbanded", source: "date_disbanded" },
      { label: "Enemies", source: "enemies" },
      { label: "Predecessors", source: "predecessors" },
      { label: "Partners", source: "partners" },
      { label: "Headquarters", source: "Headquarters" },
    ],
  },
  {
    heading: "Commissioner's Office",
    fields: [
      { label: "Commissioner", source: "commissioner_1" },
      { label: "Deputy Commissioner", source: "deputyCommissioner_1" },
      { label: "Deputy Commissioner", source: "deputyCommissioner_2" },
      { label: "Assistant Commissioner", source: "assistantCommissioner_1" },
    ],
  },
  {
    heading: "Executive Command",
    fields: [
      { label: "Chief of Police", source: "chiefOfPolice" },
      { label: "Assistant Chief of Police", source: "assistantChiefOfPolice" },
    ],
  },
  {
    heading: "High Command",
    fields: [
      { label: "Deputy Chief", source: "deputyChief" },
      { label: "Commander", source: "commander1" },
    ],
  },
  { heading: "Captain", fields: numberedFields("Captain", "captain", 2) },
  { heading: "Lieutenants", fields: numberedFields("Lieutenant", "lieutenant", 10) },
  {
    heading: "Staff Sergeants",
    fields: Array.from({ length: 6 }, (_, i) => ({
      label: `Staff Sergeant ${String(i + 1).padStart(2, "0")}`,
      source: `staff_sergeant_${i + 1}`,
    })),
  },
  { heading: "Sergeants", fields: numberedFields("Sergeant", "sergeant", 20) },
  { heading: "Corporals", fields: numberedFields("Corporal", "corporal", 20) },
  { heading: "Senior Officers", fields: numberedFields("Senior Officer", "seniorOfficer", 40) },
  { heading: "Officers", fields: numberedFields("Officer", "officer", 100) },
  { heading: "Probationary Officers", fields: numberedFields("Probationary Officer", "probationaryOfficer", 40) },
  { heading: "Cadets", fields: numberedFields("Cadet", "cadet", 40) },
];

export const BCSO_TEMPLATE: TemplateGroup[] = [
  {
    heading: "Department Information",
    fields: [
      { label: "Status", source: "status" },
      { label: "Agency Type", source: "agency_type" },
      { label: "Governing Body", source: "Governing Body" },
      { label: "Agency Executive", source: "agency_executive" },
      { label: "Date Formed", source: "date_formed" },
      { label: "Date Disbanded", source: "date_disbanded" },
      { label: "Enemies", source: "enemies" },
      { label: "Predecessors", source: "predecessors" },
      { label: "Partners", source: "partners" },
      { label: "Headquarters", source: "Headquarters" },
    ],
  },
  {
    heading: "Commissioner's Office",
    fields: [
      { label: "Commissioner", source: "commissioner_1" },
      { label: "Deputy Commissioner", source: "deputyCommissioner_1" },
      { label: "Deputy Commissioner", source: "deputyCommissioner_2" },
      { label: "Assistant Commissioner", source: "assistantCommissioner_1" },
    ],
  },
  {
    heading: "Executive Command",
    fields: [
      { label: "Sheriff", source: "sheriff_1" },
      { label: "Sheriff", source: "sheriff_2" },
      { label: "Undersheriff", source: "undersheriff" },
    ],
  },
  {
    heading: "High Command",
    fields: [
      { label: "Chief Deputy", source: "chiefDeputy" },
      { label: "Commander", source: "commander1" },
      { label: "Commander", source: "commander2" },
      { label: "Commander", source: "commander3" },
    ],
  },
  { heading: "Captains", fields: numberedFields("Captain", "captain", 4) },
  { heading: "Lieutenants", fields: numberedFields("Lieutenant", "lieutenant", 10) },
  { heading: "Staff Sergeants", fields: numberedFields("Staff Sergeant", "staff_sergeant_", 3) },
  { heading: "Sergeants", fields: numberedFields("Sergeant", "sergeant", 20) },
  { heading: "Corporals", fields: numberedFields("Corporal", "corporal", 20) },
  { heading: "Senior Deputies", fields: numberedFields("Senior Deputy", "seniorDeputy", 10) },
  { heading: "Deputies", fields: numberedFields("Deputy", "deputy", 10) },
  { heading: "Probationary Deputies", fields: numberedFields("Probationary Deputy", "probationaryDeputy", 3) },
  { heading: "Cadets", fields: numberedFields("Cadet", "cadet", 10) },
];


export const NEIGHBORHOOD_TEMPLATE: TemplateGroup[] = [
  {
    heading: "Information",
    fields: [
      { label: "Type", source: "type" },
      { label: "Also known as", source: "also_known_as" },
    ],
  },
  {
    heading: "Geographic Information",
    fields: [
      { label: "District", source: "district" },
      { label: "City/Town/Village", source: "city" },
      { label: "Cities/Towns/Villages", source: "cities" },
      { label: "County", source: "county" },
      { label: "Counties", source: "counties" },
      { label: "State", source: "state" },
    ],
  },
  {
    heading: "Other Information",
    fields: [
      { label: "Country", source: "country" },
      { label: "Gang(s)", source: "gangs" },
      { label: "Places of Interest", source: "places_of_interest" },
      { label: "Businesses", source: "businesses" },
      { label: "Notable Residents", source: "notable_residents" },
      { label: "Inhabitants", source: "inhabitants" },
      { label: "Row 1", source: "row1" },
      { label: "Row 2", source: "row2" },
      { label: "Row 3", source: "row3" },
    ],
  },
  {
    heading: "Section Header",
    fields: [
      { label: "Row 4", source: "row4" },
    ],
  },
];

export const INFOBOX_TEMPLATES: Record<InfoboxTemplateKey, InfoboxTemplateDefinition> = {
  site: {
    key: "site",
    label: "Site Infobox",
    groups: SITE_TEMPLATE,
  },
  business: {
    key: "business",
    label: "Business Infobox",
    groups: BUSINESS_TEMPLATE,
  },
  character: {
    key: "character",
    label: "Infobox character",
    groups: CHARACTER_TEMPLATE,
  },
  department: {
    key: "department",
    label: "Department Info box",
    groups: DEPARTMENT_TEMPLATE,
  },
  lspd: {
    key: "lspd",
    label: "LSPD Infobox",
    groups: LSPD_TEMPLATE,
  },
  bcso: {
    key: "bcso",
    label: "BCSO Infobox",
    groups: BCSO_TEMPLATE,
  },
  doj: {
    key: "doj",
    label: "DOJ Infobox",
    groups: DOJ_TEMPLATE,
  },
  ems: {
    key: "ems",
    label: "EMS Infobox",
    groups: EMS_TEMPLATE,
  },
  neighborhood: {
    key: "neighborhood",
    label: "Neighborhood Infobox",
    groups: NEIGHBORHOOD_TEMPLATE,
  },
};

function isDojText(text: string): boolean {
  return (
    text.includes("department of justice") ||
    text.includes("doj") ||
    text.includes("chief justice") ||
    text.includes("court of justice") ||
    text.includes("court of civil equity") ||
    text.includes("court of review")
  );
}

function isEmsText(text: string): boolean {
  return (
    text.includes("ems") ||
    text.includes("emergency medical") ||
    text.includes("paramedic") ||
    text.includes("medical center") ||
    text.includes("pillbox") ||
    text.includes("medical / hospital")
  );
}

function isBcsoText(text: string): boolean {
  return (
    text.includes("bcso") ||
    text.includes("blaine county") ||
    text.includes("sheriff") ||
    text.includes("sheriffs") ||
    text.includes("sheriff's office")
  );
}

function isLspdText(text: string): boolean {
  return (
    text.includes("lspd") ||
    text.includes("los santos police") ||
    text.includes("police department")
  );
}

export function inferInfoboxTemplate(page: { title: string; category: string }): InfoboxTemplateDefinition {
  if (page.category === "Main") return INFOBOX_TEMPLATES.site;
  if (page.category === "Business") return INFOBOX_TEMPLATES.business;
  if (page.category === "Neighborhood" || page.category === "Location") return INFOBOX_TEMPLATES.neighborhood;
  const text = `${page.title} ${page.category}`.toLowerCase();
  if (isDojText(text)) return INFOBOX_TEMPLATES.doj;
  if (isEmsText(text)) return INFOBOX_TEMPLATES.ems;
  if (isBcsoText(text)) return INFOBOX_TEMPLATES.bcso;
  if (isLspdText(text)) return INFOBOX_TEMPLATES.lspd;
  if (
    text.includes("department") ||
    text.includes("police") ||
    text.includes("sheriff") ||
    text.includes("lspd") ||
    text.includes("los santos police")
  ) {
    return INFOBOX_TEMPLATES.department;
  }
  return INFOBOX_TEMPLATES.character;
}

export function isSiteInfobox(box: { templateKey?: string }): boolean {
  return box.templateKey === "site";
}

export function isBusinessInfobox(box: { templateKey?: string }): boolean {
  return box.templateKey === "business";
}

export function isDojInfobox(box: { title?: string; templateKey?: string; fields?: InfoboxField[] }): boolean {
  if (box.templateKey) return box.templateKey === "doj";
  // Heuristic fallback: look for headings unique to the DOJ template
  const text = `${box.title || ""} ${(box.fields || []).map((f) => `${f.label} ${f.value}`).join(" ")}`.toLowerCase();
  return (
    text.includes("office of the chief justice") ||
    text.includes("court of civil equity") ||
    text.includes("court of review") ||
    text.includes("special prosecutor")
  );
}

export function isEmsInfobox(box: { title?: string; templateKey?: string; fields?: InfoboxField[] }): boolean {
  if (box.templateKey) return box.templateKey === "ems";
  // Heuristic fallback: look for headings unique to the EMS template
  const text = `${box.title || ""} ${(box.fields || []).map((f) => `${f.label} ${f.value}`).join(" ")}`.toLowerCase();
  return (
    text.includes("head paramedic") ||
    text.includes("senior emergency medical technician") ||
    text.includes("emergency medical responder")
  );
}

export function isBcsoInfobox(box: { title?: string; templateKey?: string; fields?: InfoboxField[] }): boolean {
  if (box.templateKey) return box.templateKey === "bcso";
  const text = `${box.title || ""} ${(box.fields || []).map((f) => `${f.label} ${f.value}`).join(" ")}`.toLowerCase();
  return (
    text.includes("undersheriff") ||
    text.includes("chief deputy") ||
    text.includes("probationary deputy") ||
    text.includes("senior deputy")
  );
}

export function isLspdInfobox(box: { title?: string; templateKey?: string; fields?: InfoboxField[] }): boolean {
  if (box.templateKey) return box.templateKey === "lspd";
  const text = `${box.title || ""} ${(box.fields || []).map((f) => `${f.label} ${f.value}`).join(" ")}`.toLowerCase();
  return (
    text.includes("chief of police") ||
    text.includes("assistant chief of police") ||
    text.includes("probationary officer") ||
    text.includes("senior officer")
  );
}

export function isDepartmentInfobox(box: { title?: string; templateKey?: string; fields?: InfoboxField[] }): boolean {
  if (box.templateKey) return box.templateKey === "department" || box.templateKey === "bcso" || box.templateKey === "lspd";
  // Heuristic fallback: look for headings unique to the Department template
  const text = `${box.title || ""} ${(box.fields || []).map((f) => `${f.label} ${f.value}`).join(" ")}`.toLowerCase();
  return (
    text.includes("governing body") ||
    text.includes("executive command") ||
    text.includes("commissioner's office")
  );
}

/**
 * Returns true for any infobox that should be rendered with the dark
 * department-style layout (collapsible groups, red/blue accents). This
 * covers both the Department and DOJ variants.
 */
export function isDepartmentStyleInfobox(box: { title?: string; templateKey?: string; fields?: InfoboxField[] }): boolean {
  return isDepartmentInfobox(box) || isDojInfobox(box) || isEmsInfobox(box) || isBcsoInfobox(box) || isLspdInfobox(box);
}

export function buildTemplateFields(groups: TemplateGroup[]): InfoboxField[] {
  const out: InfoboxField[] = [];
  for (const g of groups) {
    if (g.heading) {
      out.push({ label: "", value: g.heading, kind: "heading" });
    }
    for (const f of g.fields) {
      out.push({ label: templateFieldLabel(f), source: templateFieldSource(f), value: "", kind: "field" });
    }
  }
  return out;
}
