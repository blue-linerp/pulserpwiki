import Layout from "@/components/Layout";
import WikiArticle, { resolveRelatedPages } from "@/components/WikiArticle";
import { getPage, getAllPages, getCustomPagesByCategory } from "@/data/pages/server";
import { notFound, redirect } from "next/navigation";
import RecentChanges from "@/components/RecentChanges";
import Link from "next/link";
import { sidebarGroups } from "@/data/sidebar";

export const dynamic = "force-dynamic";

/** Infer a page type and pre-filled title from a slug so we can send the
 *  user straight to the right "New Page" form instead of a 404. */
function inferNewPageParams(slug: string): { type: string; title: string } | null {
  const s = slug.toLowerCase();

  // Explicit prefix matches
  if (s.startsWith("character-") || s.startsWith("char-"))
    return { type: "character", title: slug.replace(/^char(acter)?-/i, "").replace(/-/g, " ") };
  if (s.startsWith("department-") || s.startsWith("dept-"))
    return { type: "department", title: slug.replace(/^dept?(-artment)?-/i, "").replace(/-/g, " ") };
  if (s.startsWith("business-") || s.startsWith("biz-"))
    return { type: "business", title: slug.replace(/^bi?z?(-ness)?-/i, "").replace(/-/g, " ") };
  if (s.startsWith("neighborhood-") || s.startsWith("location-") || s.startsWith("district-") || s.startsWith("area-"))
    return { type: "neighborhood", title: slug.replace(/^(neighborhood|location|district|area)-/i, "").replace(/-/g, " ") };

  // Keyword hints anywhere in the slug
  if (s.includes("police") || s.includes("lspd") || s.includes("bcso") || s.includes("sheriff") || s.includes("ems") || s.includes("medical") || s.includes("department") || s.includes("agency"))
    return { type: "department", title: slug.replace(/-/g, " ") };
  if (s.includes("business") || s.includes("shop") || s.includes("store") || s.includes("company") || s.includes("corp") || s.includes("garage"))
    return { type: "business", title: slug.replace(/-/g, " ") };
  if (s.includes("neighborhood") || s.includes("district") || s.includes("location") || s.includes("street") || s.includes("avenue") || s.includes("blvd") || s.includes("beach") || s.includes("hills") || s.includes("valley") || s.includes("port") || s.includes("downtown") || s.includes("city"))
    return { type: "neighborhood", title: slug.replace(/-/g, " ") };

  // Default: assume character
  return { type: "character", title: slug.replace(/-/g, " ") };
}



export async function generateMetadata({ params }: { params: { slug: string } }) {
  const page = await getPage(params.slug);
  if (!page) return { title: "Government Departments — Pulse RP Wiki" };
  return {
    title: `${page.title} — Pulse RP Wiki`,
    description: page.description,
  };
}

export default async function WikiPage({ params }: { params: { slug: string } }) {
  // Special synthetic pages
  if (params.slug === "all-pages") return <AllPagesView />;
  if (params.slug === "recent-changes") return <RecentChangesView />;
  if (params.slug === "community") return <CommunityView />;
  if (params.slug === "departments") return <DepartmentsView />;
  if (params.slug === "characters") return <CharactersView />;
  if (params.slug === "locations") return <LocationsView />;
  if (params.slug === "police") return <PoliceView />;

  const page = await getPage(params.slug);
  if (!page) {
    const inferred = inferNewPageParams(params.slug);
    if (inferred) {
      const titleParam = encodeURIComponent(
        inferred.title
          .split(" ")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      );
      redirect(`/wiki/new?type=${inferred.type}&slug=${encodeURIComponent(params.slug)}&title=${titleParam}`);
    }
    return notFound();
  }

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
  const departments = all.filter(
    (p) =>
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


async function LocationsView() {
  const all = await getAllPages();
  const locations = all.filter(
    (p) =>
      p.category.toLowerCase() === "neighborhood" ||
      p.category.toLowerCase() === "location" ||
      p.tags.some((tag) => ["neighborhood", "location", "district", "area"].includes(tag.toLowerCase()))
  );

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
              Neighborhoods &amp; Locations
            </h2>
            <p className="mt-4 text-sm text-zinc-300">Districts, neighborhoods, and points of interest in the Pulse RP world.</p>
          </div>
        </section>
        <section>
          <h2 className="font-display font-semibold text-white text-lg mb-3 pb-2 border-b border-line relative">
            All Locations
            <span className="absolute left-0 -bottom-px h-[2px] w-12 bg-pulse-600" />
          </h2>
          {locations.length === 0 ? (
            <p className="text-sm text-zinc-400">No location pages yet.</p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1">
              {locations.map((p) => {
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



async function CharactersView() {
  const chars = await getCustomPagesByCategory("Character");

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
              Character Pages
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
            <p className="text-sm text-zinc-400">No character pages yet.</p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-3 -mx-1 px-1">
              {chars.map((p) => {
                const rawImg = p.infobox?.imageUrl || p.imageUrl;
                const img = firstGalleryImage(rawImg) || (rawImg && !rawImg.trim().startsWith("<") ? rawImg : undefined);
                return (
                  <Link key={p.slug} href={`/wiki/${p.slug}`} className="group w-36 md:w-40 shrink-0">
                    <div className="panel aspect-square overflow-hidden group-hover:border-pulse-700/60 transition">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pulse-900/40 via-panel2 to-black">
                          <div className="w-20 h-20 rounded-full border-2 border-pulse-600/70 flex items-center justify-center text-pulse-300 font-display font-black text-xl">
                            {p.title.split(/\s+/).map((w: string) => w[0]).join("").slice(0, 4)}
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

async function PoliceView() {
  const all = await getAllPages();
  const LAW_ENFORCEMENT_TAGS = ["sasp", "bcso", "lspd", "lsjpd", "law enforcement", "police", "sheriff", "state police", "joint police"];
  const officers = all.filter((p) =>
    p.category.toLowerCase() === "character" &&
    (
      p.tags.some((t) => LAW_ENFORCEMENT_TAGS.includes(t.toLowerCase())) ||
      p.subtitle?.toLowerCase().match(/sasp|bcso|lspd|lsjpd|police|sheriff|state police|joint police|law enforcement/i) ||
      p.infobox?.fields?.some((f) =>
        LAW_ENFORCEMENT_TAGS.some((tag) => f.value?.toLowerCase().includes(tag))
      )
    )
  );

  return (
    <Layout>
      <div className="space-y-6">
        <header className="border-b border-line pb-4">
          <h1 className="font-display font-extrabold text-3xl text-white">Law Enforcement</h1>
          <p className="text-zinc-400 text-sm mt-1">Character pages for law enforcement personnel across San Andreas.</p>
        </header>
        <section className="panel relative overflow-hidden">
          <div className="absolute inset-0 opacity-60 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 0%, rgba(220,38,38,0.18), transparent 55%), linear-gradient(180deg, rgba(0,0,0,0.45), rgba(0,0,0,0))" }} />
          <div className="relative px-6 py-12 text-center">
            <h2 className="inline-block font-display text-2xl md:text-4xl font-black uppercase text-white leading-none tracking-tight border-b-[6px] border-pulse-600 pb-2">
              Law Enforcement Personnel
            </h2>
            <p className="mt-4 text-sm text-zinc-300">SASP · BCSO · LSPD · LSJPD</p>
          </div>
        </section>
        <section>
          <h2 className="font-display font-semibold text-white text-lg mb-3 pb-2 border-b border-line relative">
            All Officers
            <span className="absolute left-0 -bottom-px h-[2px] w-12 bg-pulse-600" />
          </h2>
          {officers.length === 0 ? (
            <p className="text-sm text-zinc-400">No law enforcement character pages yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {officers.map((p) => {
                const rawImg = p.infobox?.imageUrl || p.imageUrl;
                const img = firstGalleryImage(rawImg) || (rawImg && !rawImg.trim().startsWith("<") ? rawImg : undefined);
                return (
                  <Link key={p.slug} href={`/wiki/${p.slug}`} className="block panel p-3 hover:border-pulse-700/60 hover:bg-panel2 transition">
                    <div className="flex items-center gap-3">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt="" className="w-12 h-12 rounded object-cover border border-line shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded bg-panel2 border border-line shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-white truncate">{p.title}</div>
                        <div className="text-[11px] text-zinc-500 truncate">{p.subtitle || p.description}</div>
                      </div>
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
