import PageEditor from "@/components/PageEditor";
import type { WikiPage } from "@/data/types";
import { buildCharacterTemplateFields } from "@/data/characterTemplate";
import { buildTemplateFields, BUSINESS_TEMPLATE, DEPARTMENT_TEMPLATE } from "@/data/infoboxTemplates";

export const dynamic = "force-dynamic";

function buildBlank(type: string): WikiPage {
  if (type === "business") {
    return {
      slug: "business-new-business",
      title: "New Business",
      subtitle: "",
      category: "Business",
      description: "A new business page.",
      updated: "Updated today",
      tags: ["Business"],
      related: [{ title: "Businesses", slug: "businesses" }],
      intro: ["Write a short description of this business."],
      sections: [
        { heading: "About", body: ["Overview and history of the business."] },
        { heading: "Services", body: ["- Service one", "- Service two"] },
        { heading: "Staff", body: ["Key personnel and roles."] },
        { heading: "Location", body: ["Where to find this business in Los Santos."] },
      ],
      infobox: {
        title: "New Business",
        templateKey: "business",
        fields: buildTemplateFields(BUSINESS_TEMPLATE),
      },
    };
  }

  if (type === "department") {
    return {
      slug: "department-new-department",
      title: "New Department",
      subtitle: "",
      category: "Department",
      description: "A new department page.",
      updated: "Updated today",
      tags: ["Department"],
      related: [{ title: "Departments", slug: "departments" }],
      intro: ["Write a short overview of this department."],
      sections: [
        { heading: "Overview", body: ["Mission, jurisdiction, and purpose."] },
        { heading: "History", body: ["Founding and notable events."] },
        { heading: "Structure", body: ["Organisational breakdown."] },
      ],
      infobox: {
        title: "New Department",
        templateKey: "department",
        fields: buildTemplateFields(DEPARTMENT_TEMPLATE),
      },
    };
  }

  // Default: character
  return {
    slug: "character-new-character",
    title: "New Character",
    subtitle: "",
    category: "Character",
    description: "A new character page.",
    updated: "Updated today",
    tags: ["Character"],
    related: [{ title: "Characters", slug: "characters" }],
    intro: ["Write a short introductory paragraph for this character."],
    sections: [
      { heading: "Background", body: ["Backstory and origins."] },
      { heading: "Career", body: ["Notable employment, ranks, or affiliations."] },
      { heading: "Personality", body: ["Traits, quirks, and motivations."] },
      { heading: "Notable Events", body: ["- Event one", "- Event two"] },
    ],
    infobox: {
      title: "New Character",
      templateKey: "character",
      fields: buildCharacterTemplateFields(),
    },
  };
}

export default function NewPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const blank = buildBlank(searchParams.type ?? "character");
  return <PageEditor initial={blank} mode="create" />;
}
