import type { InfoboxField } from "./types";

/**
 * Standard character infobox template, structured into named groups.
 * Used by the "Character template" preset and the "Manage fields" modal.
 */
export interface TemplateGroup {
  heading: string;
  fields: TemplateField[];
}

export type TemplateField = string | { label: string; source: string };

export const templateFieldLabel = (field: TemplateField): string =>
  typeof field === "string" ? field : field.label;

export const templateFieldSource = (field: TemplateField): string =>
  typeof field === "string" ? field : field.source;

export const CHARACTER_TEMPLATE: TemplateGroup[] = [
  {
    heading: "",
    fields: [
      { label: "Status", source: "status" },
      { label: "Server", source: "server" },
      { label: "Aliases", source: "aliases" },
      { label: "Relatives", source: "relatives" },
    ],
  },
  {
    heading: "Biographical Information",
    fields: [
      { label: "Species", source: "species" },
      { label: "Gender", source: "gender" },
      { label: "Pronouns", source: "pronouns" },
      { label: "Date of Birth", source: "birthDate" },
      { label: "Age", source: "age" },
      { label: "Place of Birth", source: "birthPlace" },
      { label: "Nationality", source: "nationality" },
      { label: "Net Worth", source: "networth" },
      { label: "Criminal Record", source: "criminal_record" },
      { label: "Phone Number", source: "phone_#" },
      { label: "State ID", source: "state_identification_number" },
      { label: "Bank Account Number", source: "bank_account_number" },
      { label: "Licenses", source: "licenses" },
      { label: "Memberships", source: "membership" },
      { label: "Residence", source: "residence" },
    ],
  },
  {
    heading: "Physical Attributes",
    fields: [
      { label: "Height", source: "height" },
      { label: "Weight", source: "weight" },
      { label: "Eye Color", source: "eyes" },
      { label: "Hair Color", source: "hair" },
    ],
  },
  {
    heading: "Death Certificate",
    fields: [
      { label: "Date of Death", source: "deathDate" },
      { label: "Place of Death", source: "deathPlace" },
      { label: "Cause of Death", source: "deathCause" },
    ],
  },
  {
    heading: "Relationship Information",
    fields: [
      { label: "Marital Status", source: "marital" },
      { label: "Sexuality", source: "sexuality" },
      { label: "Partner(s)", source: "partner" },
      { label: "Ex Partner(s)", source: "ex_partners" },
      { label: "Parents", source: "parents" },
      { label: "Siblings", source: "siblings" },
      { label: "Children", source: "children" },
      { label: "Grandchildren", source: "grandchildren" },
      { label: "Extended", source: "extended" },
      { label: "Pets", source: "pets" },
      { label: "Allies/Friends", source: "allies" },
      { label: "Enemies", source: "enemies" },
    ],
  },
  {
    heading: "Faction Information",
    fields: [
      { label: "Affiliation", source: "Affiliation" },
      { label: "Faction Affiliation", source: "factionAffiliation" },
      { label: "Gang Affiliation", source: "gangAffiliation" },
      { label: "Gang Rank", source: "gangRank" },
      { label: "Former Gang(s)", source: "formergang" },
      { label: "Racing Crew", source: "racingCrew" },
      { label: "Racing Crew Rank", source: "racingCrewRank" },
      { label: "Other Affiliation", source: "affiliation" },
      { label: "Former Affiliation", source: "formerAffiliation" },
      { label: "Former Affiliation Rank", source: "formerAffiliationRank" },
    ],
  },
  {
    heading: "Employment Information",
    fields: [
      { label: "Business Name", source: "employer" },
      { label: "Occupation", source: "occupation" },
      { label: "Rank", source: "rank" },
      { label: "Certifications", source: "certs" },
      { label: "Former Job(s)", source: "formerJob" },
    ],
  },
  {
    heading: "Law Enforcement Detail",
    fields: [
      { label: "Status", source: "leoStatus" },
      { label: "Badge #", source: "leoBadge#" },
      { label: "Insignia", source: "leoInsignia" },
    ],
  },
  {
    heading: "Department of Accountability Detail",
    fields: [
      { label: "Status", source: "DOAStatus" },
      { label: "Call-Sign", source: "DOACallSign" },
      { label: "Insignia", source: "DOAInsignia" },
    ],
  },
  {
    heading: "Department of Corrections Detail",
    fields: [
      { label: "Status", source: "docStatus" },
      { label: "Badge #", source: "docBadge#" },
      { label: "Insignia", source: "docInsignia" },
    ],
  },
  {
    heading: "Emergency Medical Services Detail",
    fields: [
      { label: "Status", source: "EMSStatus" },
      { label: "Call-Sign", source: "EMSCallSign" },
      { label: "Insignia", source: "EMSInsignia" },
    ],
  },
  {
    heading: "Los Santos Medical Group Detail",
    fields: [
      { label: "Status", source: "DoctorStatus" },
      { label: "Doctor Number", source: "DoctorNumber" },
      { label: "Insignia", source: "DoctorInsignia" },
    ],
  },
  {
    heading: "Los Santos Police Dispatch Detail",
    fields: [
      { label: "Status", source: "dispatchStatus" },
      { label: "Badge #", source: "dispatchBadge#" },
      { label: "Insignia", source: "dispatchInsignia" },
    ],
  },
  {
    heading: "Department of Justice Detail",
    fields: [
      { label: "Status", source: "DOJStatus" },
      { label: "Position", source: "DOJPositions" },
    ],
  },
  {
    heading: "Fears",
    fields: [
      { label: "Biggest Weakness", source: "biggestWeakness" },
      { label: "Minor Fear", source: "minorFear" },
      { label: "General Fears", source: "generalFear" },
    ],
  },
  {
    heading: "Role-player Information",
    fields: [
      { label: "Portrayed By", source: "portrayedby" },
      { label: "Played By", source: "PlayedBy" },
      { label: "Characters", source: "characters" },
    ],
  },
];

/** Build the default character infobox fields array (all template fields included). */
export function buildCharacterTemplateFields(): InfoboxField[] {
  const out: InfoboxField[] = [];
  for (const g of CHARACTER_TEMPLATE) {
    if (g.heading) {
      out.push({ label: "", value: g.heading, kind: "heading" });
    }
    for (const f of g.fields) {
      out.push({ label: templateFieldLabel(f), source: templateFieldSource(f), value: "", kind: "field" });
    }
  }
  return out;
}

/** Flat list of all standard field labels for the manage-fields modal. */
export const ALL_TEMPLATE_FIELD_LABELS: string[] = CHARACTER_TEMPLATE.flatMap((g) =>
  g.fields.map(templateFieldLabel)
);
