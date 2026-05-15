export interface InfoboxField {
  label: string;
  value: string;
  source?: string;
  /** "heading" renders a centered section header spanning both columns. Default "field". */
  kind?: "heading" | "field";
}
export interface Infobox {
  title: string;
  imageLabel?: string;
  imageUrl?: string;
  templateKey?: string;
  fields: InfoboxField[];
}
export interface PageSection {
  heading: string;
  body: string[]; // lines: "- " => list item; "" => paragraph break
}
export interface WikiPage {
  slug: string;
  title: string;
  subtitle?: string;
  category: string;
  description: string;
  updated: string;
  tags: string[];
  related: { title: string; slug: string }[];
  infobox?: Infobox;
  intro?: string[];
  sections: PageSection[];
  imageUrl?: string;
  /**
   * Rich-text article body as HTML (TipTap output).
   * When present, replaces the intro+sections rendering.
   */
  content?: string;
}
