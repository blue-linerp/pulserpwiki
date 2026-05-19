import Layout from "@/components/Layout";
import WikiArticle, { resolveRelatedPages } from "@/components/WikiArticle";
import { getPage, getAllPages, getCustomPagesByCategory } from "@/data/pages/server";
import { notFound, redirect } from "next/navigation";
import { getSettings, isPageEnabled } from "@/lib/siteSettings";
import RecentChanges from "@/components/RecentChanges";
import Link from "next/link";
import { sidebarGroups } from "@/data/sidebar";

export const dynamic = "force-dynamic";

function decodeSlug(slug: string): string {
  try { return decodeURIComponent(slug); } catch { return slug; }
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const page = await getPage(decodeSlug(params.slug));
  if (!page) return { title: "Government Departments — Pulse RP Wiki" };
  return {
    title: `${page.title} — Pulse RP Wiki`,
    description: page.description,
  };
}

export default async function WikiPage({ params }: { params: { slug: string } }) {
  const slug = decodeSlug(params.slug);
  // Check if this page is disabled via admin settings
  const settings = await getSettings();
  if (!isPageEnabled(settings, slug)) {
    return (
      <Layout>
        <div className="panel p-16 text-center space-y-4">
          <p className="text-pulse-500 text-xs uppercase tracking-[0.2em]">Coming Soon</p>
          <h1 className="font-display font-extrabold text-3xl text-white">This page is not yet available</h1>
          <p className="text-zinc-400 text-sm">This section of the wiki is still being written. Check back soon.</p>
          <a href="/" className="inline-block mt-4 px-4 py-2 rounded-md bg-pulse-600 hover:bg-pulse-500 text-white text-sm font-semibold border border-pulse-500/60 shadow-glow">
            Return to Main Page
          </a>
        </div>
      </Layout>
    );
  }

  // Special synthetic pages
  if (slug === "all-pages") return <AllPagesView />;
  if (slug === "recent-changes") return <RecentChangesView />;
  if (slug === "community") return <CommunityView />;
  if (slug === "Category:Departments") return <DepartmentsView />;
  if (slug === "departments") redirect("/wiki/Category:Departments");
  if (slug === "Category:Characters") return <CharactersView />;
  if (slug === "Category:Police") return <PoliceView />;
  if (slug === "Category:Locations") return <LocationsView />;
  if (slug === "Category:Businesses") return <BusinessesView />;
  if (slug === "Category:Vehicles") redirect("/wiki/Category:Vehicles");
  if (slug === "Category:Weapons") redirect("/wiki/Category:Weapons");
  // Redirect old plain slugs to their Category: equivalents
  if (slug === "characters") redirect("/wiki/Category:Characters");
  if (slug === "police") redirect("/wiki/Category:Police");
  if (slug === "locations") redirect("/wiki/Category:Locations");
  if (slug === "businesses") redirect("/wiki/Category:Businesses");

  const page = await getPage(slug);
  if (!page) return notFound();

  const relatedPages = await resolveRelatedPages(page);
  return (
    <Layout>
      <WikiArticle page={page} relatedPages={relatedPages} />
    </Layout>
  );
}

async function AllPagesView() {
  const all = await getAllPages();
  const grouped: Record<string, typeof all> = {};
  for (const p of all) {
    grouped[p.category] = grouped[p.category] || [];
    grouped[p.category].push(p);
  }
  return (
    <Layout>
      <div className="space-y-6">
        <header className="border-b border-line pb-4">
          <h1 className="font-display font-extrabold text-3xl text-white">All Pages</h1>
          <p className="text-zinc-400 text-sm mt-1">A complete index of every article on the Pulse RP Wiki.</p>
        </header>
        <div className="grid md:grid-cols-2 gap-4">
          {Object.entries(grouped).map(([cat, items]) => (
            <section key={cat} className="panel p-4">
              <h2 className="font-display font-semibold text-white text-sm uppercase tracking-wider mb-2 pb-2 border-b border-line">
                {cat}
              </h2>
              <ul className="space-y-1.5">
                {items.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/wiki/${p.slug}`} className="text-sm text-zinc-300 hover:text-pulse-400">
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </Layout>
  );
}

const GALLERY_RE = /<gallery\b[^>]*type=["']slideshow["'][^>]*>([\s\S]*?)<\/gallery>/i;

function resolveImageSrc(filename: string): string {
  return /^https?:\/\//i.test(filename)
    ? filename
    : filename.startsWith("/")
    ? filename
    : filename.startsWith("uploads/")
    ? `/${filename}`
    : `/uploads/${filename}`;
}

function firstGalleryImage(value?: string): string | undefined {
  if (!value) return undefined;
  const match = value.match(GALLERY_RE);
  if (!match) return value;
  const first = match[1]
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith("<") && !line.startsWith("}"));
  if (!first) return undefined;
  const filename = first.split("|")[0].replace(/^File:/i, "").trim();
  return filename ? resolveImageSrc(filename) : undefined;
}

async function DepartmentsView() {
  const all = await getAllPages();
  const settings = await getSettings();
  const departments = all.filter(
    (p) =>
      isPageEnabled(settings, p.slug) &&
      p.slug !== "department-of-justice-legislation" &&
      (p.category.toLowerCase() === "department" ||
      p.infobox?.templateKey === "department" ||
      p.tags.some((tag) => tag.toLowerCase() === "department") ||
      p.slug === "los-santos-police-department")
  );
  const lspd = await getPage("los-santos-police-department");
  if (lspd && !departments.some((p) => p.slug === lspd.slug)) departments.push(lspd);

  return (
    <Layout>
      <div className="space-y-6">
        <header className="border-b border-line pb-4">
          <h1 className="font-display font-extrabold text-3xl text-white">Departments</h1>
          <p className="text-zinc-400 text-sm mt-1">Category page</p>
        </header>
        <section className="panel relative overflow-hidden">
          <div className="absolute inset-0 opacity-60 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 0%, rgba(220,38,38,0.18), transparent 55%), linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0))" }} />
          <div className="relative px-6 py-12 text-center">
            <h2 className="inline-block font-display text-2xl md:text-4xl font-black uppercase text-white leading-none tracking-tight border-b-[6px] border-pulse-600 pb-2">
              Government Departments
            </h2>
            <p className="mt-4 text-sm text-zinc-300">This category is for Government Departments.</p>
          </div>
        </section>
        <section>
          <h2 className="font-display font-semibold text-white text-lg mb-3 pb-2 border-b border-line relative">
            All Departments
            <span className="absolute left-0 -bottom-px h-[2px] w-12 bg-pulse-600" />
          </h2>
          {departments.length === 0 ? (
            <p className="text-sm text-zinc-400">No department pages yet.</p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1">
              {departments.map((p) => {
                const img = firstGalleryImage(p.infobox?.imageUrl || p.infobox?.imageLabel) || p.imageUrl;
                return (
                  <Link key={p.slug} href={`/wiki/${p.slug}`} className="group w-36 md:w-40 shrink-0">
                    <div className="panel aspect-square overflow-hidden group-hover:border-pulse-700/60 transition">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pulse-900/40 via-panel2 to-black">
                          <div className="w-20 h-20 rounded-full border-2 border-pulse-600/70 flex items-center justify-center text-pulse-300 font-display font-black text-xl">
                            {p.title.split(/\s+/).map((w) => w[0]).join("").slice(0, 4)}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-xs md:text-sm font-semibold text-zinc-100 leading-tight group-hover:text-pulse-300 transition">
                      {p.title}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

function RecentChangesView() {
  return (
    <Layout>
      <div className="space-y-6">
        <header className="border-b border-line pb-4">
          <h1 className="font-display font-extrabold text-3xl text-white">Recent Changes</h1>
          <p className="text-zinc-400 text-sm mt-1">A live feed of the most recent edits across the wiki.</p>
        </header>
        <RecentChanges />
      </div>
    </Layout>
  );
}

function CommunityView() {
  return (
    <Layout>
      <div className="space-y-6">
        <header className="border-b border-line pb-4">
          <h1 className="font-display font-extrabold text-3xl text-white">Community Portal</h1>
          <p className="text-zinc-400 text-sm mt-1">Connect with other Pulse RP players, contributors, and staff.</p>
        </header>
        <div className="grid md:grid-cols-2 gap-4">
          {sidebarGroups.map((g) => (
            <section key={g.title} className="panel p-4">
              <h2 className="font-display font-semibold text-white text-sm uppercase tracking-wider mb-2 pb-2 border-b border-line">
                {g.title}
              </h2>
              <ul className="space-y-1.5">
                {g.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="text-sm text-zinc-300 hover:text-pulse-400">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </Layout>
  );
}

async function CharactersView() {
  const all = await getAllPages();
  const settings = await getSettings();
  const chars = all.filter(
    (p) =>
      isPageEnabled(settings, p.slug) &&
      p.category.toLowerCase() === "character" &&
      p.slug !== "character-creation" &&
      p.slug !== "character-template"
  );

  return (
    <Layout>
      <div className="space-y-6">
        <header className="border-b border-line pb-4">
          <h1 className="font-display font-extrabold text-3xl text-white">Characters</h1>
          <p className="text-zinc-400 text-sm mt-1">Category page</p>
        </header>
        <section className="panel relative overflow-hidden">
          <div className="absolute inset-0 opacity-60 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 0%, rgba(220,38,38,0.18), transparent 55%), linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0))" }} />
          <div className="relative px-6 py-12 text-center">
            <h2 className="inline-block font-display text-2xl md:text-4xl font-black uppercase text-white leading-none tracking-tight border-b-[6px] border-pulse-600 pb-2">
              Characters
            </h2>
            <p className="mt-4 text-sm text-zinc-300">Player-driven personas, biographies, and storylines.</p>
          </div>
        </section>
        <section>
          <h2 className="font-display font-semibold text-white text-lg mb-3 pb-2 border-b border-line relative">
            All Characters
            <span className="absolute left-0 -bottom-px h-[2px] w-12 bg-pulse-600" />
          </h2>
          {chars.length === 0 ? (
            <p className="text-sm text-zinc-400">No character pages yet. Be the first to add yours!</p>
          ) : (
            <div className="flex gap-4 flex-wrap">
              {chars.map((p) => {
                const img = firstGalleryImage(p.infobox?.imageUrl || p.infobox?.imageLabel) || p.imageUrl;
                return (
                  <Link key={p.slug} href={`/wiki/${p.slug}`} className="group w-36 md:w-40 shrink-0">
                    <div className="panel aspect-square overflow-hidden group-hover:border-pulse-700/60 transition">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pulse-900/40 via-panel2 to-black">
                          <div className="w-20 h-20 rounded-full border-2 border-pulse-600/70 flex items-center justify-center text-pulse-300 font-display font-black text-xl">
                            {p.title.split(/\s+/).map((w) => w[0]).join("").slice(0, 4)}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-xs md:text-sm font-semibold text-zinc-100 leading-tight group-hover:text-pulse-300 transition">
                      {p.title}
                    </div>
                    {p.subtitle && (
                      <div className="text-[11px] text-zinc-500 leading-tight mt-0.5 line-clamp-2">{p.subtitle}</div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

async function PoliceView() {
  const all = await getAllPages();

  const settings = await getSettings();
  const DEPT_SLUGS = [
    "los-santos-police-department",
    "los-santos-junior-police-department",
    "blaine-county-sheriffs-office",
    "san-andreas-state-police",
  ];
  const DEPT_TAGS = ["lspd", "lsjpd", "bcso", "sasp", "law enforcement", "police"];
  const DEPT_LABELS: Record<string, string> = {
    "los-santos-police-department": "Los Santos Police Department",
    "los-santos-junior-police-department": "Los Santos Junior Police Department",
    "blaine-county-sheriffs-office": "Blaine County Sheriff's Office",
    "san-andreas-state-police": "San Andreas State Police",
  };

  // Group characters by their affiliated department
  const groups: Record<string, ReturnType<typeof all.filter>> = {
    "los-santos-police-department": [],
    "los-santos-junior-police-department": [],
    "blaine-county-sheriffs-office": [],
    "san-andreas-state-police": [],
    "other": [],
  };

  const policeChars = all.filter((p) => {
    if (!isPageEnabled(settings, p.slug)) return false;
    if (p.category.toLowerCase() !== "character") return false;
    if (p.slug === "character-creation" || p.slug === "character-template") return false;
    const fields = p.infobox?.fields ?? [];
    const allText = [
      ...fields.map((f) => (f.value || "").toLowerCase()),
      ...p.tags.map((t) => t.toLowerCase()),
      (p.subtitle || "").toLowerCase(),
      (p.description || "").toLowerCase(),
    ].join(" ");
    return DEPT_TAGS.some((tag) => allText.includes(tag));
  });

  for (const p of policeChars) {
    const fields = p.infobox?.fields ?? [];
    const allText = [
      ...fields.map((f) => (f.value || "").toLowerCase()),
      ...p.tags.map((t) => t.toLowerCase()),
    ].join(" ");

    if (allText.includes("junior") || allText.includes("lsjpd")) {
      groups["los-santos-junior-police-department"].push(p);
    } else if (allText.includes("lspd") || allText.includes("los santos police")) {
      groups["los-santos-police-department"].push(p);
    } else if (allText.includes("bcso") || allText.includes("blaine county")) {
      groups["blaine-county-sheriffs-office"].push(p);
    } else if (allText.includes("sasp") || allText.includes("state police")) {
      groups["san-andreas-state-police"].push(p);
    } else {
      groups["other"].push(p);
    }
  }

  const activeGroups = DEPT_SLUGS.filter((s) => groups[s].length > 0);

  return (
    <Layout>
      <div className="space-y-6">
        <header className="border-b border-line pb-4">
          <h1 className="font-display font-extrabold text-3xl text-white">Law Enforcement</h1>
          <p className="text-zinc-400 text-sm mt-1">Category page</p>
        </header>
        <section className="panel relative overflow-hidden">
          <div className="absolute inset-0 opacity-60 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 0%, rgba(37,99,235,0.18), transparent 55%), linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0))" }} />
          <div className="relative px-6 py-12 text-center">
            <h2 className="inline-block font-display text-2xl md:text-4xl font-black uppercase text-white leading-none tracking-tight border-b-[6px] border-blue-600 pb-2">
              Law Enforcement Characters
            </h2>
            <p className="mt-4 text-sm text-zinc-300">Officer profiles across all law enforcement agencies in San Andreas.</p>
          </div>
        </section>

        {policeChars.length === 0 ? (
          <div className="panel p-8 text-center">
            <p className="text-zinc-400 text-sm">No law enforcement character pages yet.</p>
          </div>
        ) : (
          activeGroups.map((deptSlug) => (
            <section key={deptSlug}>
              <h2 className="font-display font-semibold text-white text-lg mb-3 pb-2 border-b border-line relative">
                {DEPT_LABELS[deptSlug]}
                <span className="absolute left-0 -bottom-px h-[2px] w-12 bg-blue-600" />
              </h2>
              <div className="flex gap-4 flex-wrap">
                {groups[deptSlug].map((p) => {
                  const img = firstGalleryImage(p.infobox?.imageUrl || p.infobox?.imageLabel) || p.imageUrl;
                  return (
                    <Link key={p.slug} href={`/wiki/${p.slug}`} className="group w-36 md:w-40 shrink-0">
                      <div className="panel aspect-square overflow-hidden group-hover:border-blue-700/60 transition">
                        {img ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/40 via-panel2 to-black">
                            <div className="w-20 h-20 rounded-full border-2 border-blue-600/70 flex items-center justify-center text-blue-300 font-display font-black text-xl">
                              {p.title.split(/\s+/).map((w) => w[0]).join("").slice(0, 4)}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="mt-2 text-xs md:text-sm font-semibold text-zinc-100 leading-tight group-hover:text-blue-300 transition">
                        {p.title}
                      </div>
                      {p.subtitle && (
                        <div className="text-[11px] text-zinc-500 leading-tight mt-0.5 line-clamp-2">{p.subtitle}</div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))
        )}

        {groups["other"].length > 0 && (
          <section>
            <h2 className="font-display font-semibold text-white text-lg mb-3 pb-2 border-b border-line relative">
              Other Law Enforcement
              <span className="absolute left-0 -bottom-px h-[2px] w-12 bg-blue-600" />
            </h2>
            <div className="flex gap-4 flex-wrap">
              {groups["other"].map((p) => {
                const img = firstGalleryImage(p.infobox?.imageUrl || p.infobox?.imageLabel) || p.imageUrl;
                return (
                  <Link key={p.slug} href={`/wiki/${p.slug}`} className="group w-36 md:w-40 shrink-0">
                    <div className="panel aspect-square overflow-hidden group-hover:border-blue-700/60 transition">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900/40 via-panel2 to-black">
                          <div className="w-20 h-20 rounded-full border-2 border-blue-600/70 flex items-center justify-center text-blue-300 font-display font-black text-xl">
                            {p.title.split(/\s+/).map((w) => w[0]).join("").slice(0, 4)}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-xs md:text-sm font-semibold text-zinc-100 leading-tight group-hover:text-blue-300 transition">
                      {p.title}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}

async function LocationsView() {
  const all = await getAllPages();
  const settings = await getSettings();
  const LOCATION_CATEGORIES = ["location", "neighborhood", "landmark", "district", "region"];
  const locations = all.filter(
    (p) =>
      isPageEnabled(settings, p.slug) &&
      p.slug !== "locations" &&
      (
        LOCATION_CATEGORIES.includes(p.category.toLowerCase()) ||
        p.tags.some((t) => ["location", "neighborhood", "landmark", "district"].includes(t.toLowerCase()))
      )
  );

  // Group by region tag if present
  const REGIONS = ["Los Santos", "Blaine County", "Sandy Shores", "Paleto Bay", "Vinewood"];
  const groups: Record<string, typeof locations> = {};
  const ungrouped: typeof locations = [];

  for (const p of locations) {
    const matched = REGIONS.find((r) =>
      p.tags.some((t) => t.toLowerCase() === r.toLowerCase()) ||
      (p.subtitle || "").toLowerCase().includes(r.toLowerCase())
    );
    if (matched) {
      groups[matched] = groups[matched] || [];
      groups[matched].push(p);
    } else {
      ungrouped.push(p);
    }
  }

  const activeRegions = REGIONS.filter((r) => groups[r]?.length > 0);

  return (
    <Layout>
      <div className="space-y-6">
        <header className="border-b border-line pb-4">
          <h1 className="font-display font-extrabold text-3xl text-white">Locations</h1>
          <p className="text-zinc-400 text-sm mt-1">Category page</p>
        </header>
        <section className="panel relative overflow-hidden">
          <div className="absolute inset-0 opacity-60 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 0%, rgba(220,38,38,0.18), transparent 55%), linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0))" }} />
          <div className="relative px-6 py-12 text-center">
            <h2 className="inline-block font-display text-2xl md:text-4xl font-black uppercase text-white leading-none tracking-tight border-b-[6px] border-pulse-600 pb-2">
              Locations
            </h2>
            <p className="mt-4 text-sm text-zinc-300">The cities, neighborhoods, and landmarks of San Andreas.</p>
          </div>
        </section>

        {locations.length === 0 ? (
          <div className="panel p-8 text-center">
            <p className="text-zinc-400 text-sm">No location pages yet.</p>
          </div>
        ) : (
          <>
            {activeRegions.map((region) => (
              <section key={region}>
                <h2 className="font-display font-semibold text-white text-lg mb-3 pb-2 border-b border-line relative">
                  {region}
                  <span className="absolute left-0 -bottom-px h-[2px] w-12 bg-pulse-600" />
                </h2>
                <div className="flex gap-4 flex-wrap">
                  {groups[region].map((p) => {
                    const img = firstGalleryImage(p.infobox?.imageUrl || p.infobox?.imageLabel) || p.imageUrl;
                    return (
                      <Link key={p.slug} href={`/wiki/${p.slug}`} className="group w-36 md:w-40 shrink-0">
                        <div className="panel aspect-square overflow-hidden group-hover:border-pulse-700/60 transition">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pulse-900/40 via-panel2 to-black">
                              <div className="w-20 h-20 rounded-full border-2 border-pulse-600/70 flex items-center justify-center text-pulse-300 font-display font-black text-xl">
                                {p.title.split(/\s+/).map((w) => w[0]).join("").slice(0, 4)}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 text-xs md:text-sm font-semibold text-zinc-100 leading-tight group-hover:text-pulse-300 transition">
                          {p.title}
                        </div>
                        {p.subtitle && (
                          <div className="text-[11px] text-zinc-500 leading-tight mt-0.5 line-clamp-2">{p.subtitle}</div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </section>
            ))}

            {ungrouped.length > 0 && (
              <section>
                <h2 className="font-display font-semibold text-white text-lg mb-3 pb-2 border-b border-line relative">
                  {activeRegions.length > 0 ? "Other Locations" : "All Locations"}
                  <span className="absolute left-0 -bottom-px h-[2px] w-12 bg-pulse-600" />
                </h2>
                <div className="flex gap-4 flex-wrap">
                  {ungrouped.map((p) => {
                    const img = firstGalleryImage(p.infobox?.imageUrl || p.infobox?.imageLabel) || p.imageUrl;
                    return (
                      <Link key={p.slug} href={`/wiki/${p.slug}`} className="group w-36 md:w-40 shrink-0">
                        <div className="panel aspect-square overflow-hidden group-hover:border-pulse-700/60 transition">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pulse-900/40 via-panel2 to-black">
                              <div className="w-20 h-20 rounded-full border-2 border-pulse-600/70 flex items-center justify-center text-pulse-300 font-display font-black text-xl">
                                {p.title.split(/\s+/).map((w) => w[0]).join("").slice(0, 4)}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 text-xs md:text-sm font-semibold text-zinc-100 leading-tight group-hover:text-pulse-300 transition">
                          {p.title}
                        </div>
                        {p.subtitle && (
                          <div className="text-[11px] text-zinc-500 leading-tight mt-0.5 line-clamp-2">{p.subtitle}</div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

async function BusinessesView() {
  const all = await getAllPages();
  const settings = await getSettings();
  const BUSINESS_CATEGORIES = ["business", "businesses", "company", "organisation", "organization"];
  const businesses = all.filter(
    (p) =>
      isPageEnabled(settings, p.slug) &&
      p.slug !== "businesses" &&
      (
        BUSINESS_CATEGORIES.includes(p.category.toLowerCase()) ||
        p.tags.some((t) => ["business", "company", "organisation", "organization"].includes(t.toLowerCase()))
      )
  );

  return (
    <Layout>
      <div className="space-y-6">
        <header className="border-b border-line pb-4">
          <h1 className="font-display font-extrabold text-3xl text-white">Businesses</h1>
          <p className="text-zinc-400 text-sm mt-1">Category page</p>
        </header>
        <section className="panel relative overflow-hidden">
          <div className="absolute inset-0 opacity-60 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 0%, rgba(220,38,38,0.18), transparent 55%), linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0))" }} />
          <div className="relative px-6 py-12 text-center">
            <h2 className="inline-block font-display text-2xl md:text-4xl font-black uppercase text-white leading-none tracking-tight border-b-[6px] border-pulse-600 pb-2">
              Businesses
            </h2>
            <p className="mt-4 text-sm text-zinc-300">Legal storefronts, services, and player-run companies across San Andreas.</p>
          </div>
        </section>

        <section>
          <h2 className="font-display font-semibold text-white text-lg mb-3 pb-2 border-b border-line relative">
            All Businesses
            <span className="absolute left-0 -bottom-px h-[2px] w-12 bg-pulse-600" />
          </h2>
          {businesses.length === 0 ? (
            <div className="panel p-8 text-center">
              <p className="text-zinc-400 text-sm">No business pages yet.</p>
            </div>
          ) : (
            <div className="flex gap-4 flex-wrap">
              {businesses.map((p) => {
                const img = firstGalleryImage(p.infobox?.imageUrl || p.infobox?.imageLabel) || p.imageUrl;
                return (
                  <Link key={p.slug} href={`/wiki/${p.slug}`} className="group w-36 md:w-40 shrink-0">
                    <div className="panel aspect-square overflow-hidden group-hover:border-pulse-700/60 transition">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pulse-900/40 via-panel2 to-black">
                          <div className="w-20 h-20 rounded-full border-2 border-pulse-600/70 flex items-center justify-center text-pulse-300 font-display font-black text-xl">
                            {p.title.split(/\s+/).map((w) => w[0]).join("").slice(0, 4)}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-xs md:text-sm font-semibold text-zinc-100 leading-tight group-hover:text-pulse-300 transition">
                      {p.title}
                    </div>
                    {p.subtitle && (
                      <div className="text-[11px] text-zinc-500 leading-tight mt-0.5 line-clamp-2">{p.subtitle}</div>
                    )}
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}