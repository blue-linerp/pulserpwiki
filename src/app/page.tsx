import Layout from "@/components/Layout";
import CategoryGrid from "@/components/CategoryGrid";
import RecentChanges from "@/components/RecentChanges";
import WikiInfobox from "@/components/WikiInfobox";
import Breadcrumbs from "@/components/Breadcrumbs";
import { getPage } from "@/data/pages/server";
import { Pencil, History, MessagesSquare, Sparkles, ShieldCheck, Users2, Hammer, MessageCircle } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const page = await getPage("main-page");
  return (
    <Layout>
      <div className="space-y-6">
        <Breadcrumbs items={[{ label: "Main Page" }]} />

        {/* Hero */}
        <section className="relative panel overflow-hidden">
          <div className="absolute inset-0 opacity-50 pointer-events-none"
               style={{ backgroundImage: "radial-gradient(800px 200px at 20% 0%, rgba(220,38,38,0.18), transparent 60%)" }} />
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-pulse-700 via-pulse-500 to-crimson" />
          <div className="relative p-6 md:p-8">
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-pulse-400 mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Pulse Roleplay Wiki
            </div>
            <h1 className="font-display font-extrabold text-3xl md:text-5xl text-white tracking-tight">
              Welcome To The <span className="text-pulse-500">Pulse Roleplay</span> Wiki
            </h1>
            <p className="text-zinc-300 mt-4 max-w-3xl text-sm md:text-base leading-relaxed">
              Pulse RP is a serious FiveM roleplay community built around immersive storytelling,
              custom systems, realistic roleplay, and a player-driven economy. This wiki is designed
              to help new and existing players understand the world of Pulse Roleplay.
            </p>
            <div className="mt-5 flex items-center flex-wrap gap-2">
              <Link href="/wiki/getting-started" className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-pulse-600 hover:bg-pulse-500 text-white text-sm font-semibold shadow-glow border border-pulse-500/60 transition">
                Getting Started
              </Link>
              <Link href="/wiki/server-rules" className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-line bg-panel2 hover:bg-panel text-zinc-200 text-sm transition">
                <ShieldCheck className="w-4 h-4" /> Server Rules
              </Link>
              <a href="#" className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-[#5865F2]/40 bg-[#5865F2]/10 hover:bg-[#5865F2]/20 text-[#c7cdff] text-sm transition">
                <MessageCircle className="w-4 h-4" /> Join Discord
              </a>
              <div className="ml-auto hidden md:flex items-center gap-1.5">
                <HeaderBtn href="/wiki/main-page/edit" icon={<Pencil className="w-3.5 h-3.5" />}>Edit</HeaderBtn>
                <HeaderBtn icon={<History className="w-3.5 h-3.5" />}>History</HeaderBtn>
                <HeaderBtn icon={<MessagesSquare className="w-3.5 h-3.5" />}>Talk</HeaderBtn>
              </div>
            </div>
          </div>
        </section>

        {/* Categories + Infobox */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-6 min-w-0">
            <section>
              <SectionHeader title="Browse Categories" subtitle="Click a tile to explore that section of the wiki." />
              <CategoryGrid />
            </section>

            <section>
              <SectionHeader title="Pulse RP Information" subtitle="Quick facts every member should know." />
              <ul className="grid gap-2 sm:grid-cols-2">
                {[
                  "Before joining, read the server rules.",
                  "New players should review the Getting Started guide.",
                  "Applications are handled through the Pulse RP website.",
                  "Players can contribute character, business, and lore pages.",
                  "Staff may update official department and system pages.",
                ].map((t, i) => (
                  <li key={i} className="panel p-3.5 text-sm text-zinc-300 flex gap-3">
                    <span className="shrink-0 w-1.5 mt-1 h-5 bg-pulse-600 rounded-full" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="grid md:grid-cols-2 gap-4">
              <CommunityCard
                icon={<Users2 className="w-5 h-5" />}
                title="Community Links"
                items={[
                  { label: "Pulse RP Discord", href: "#" },
                  { label: "Forums & Announcements", href: "#" },
                  { label: "Whitelist Application", href: "/wiki/application-process" },
                  { label: "Staff Reports", href: "#" },
                ]}
              />
              <CommunityCard
                icon={<Hammer className="w-5 h-5" />}
                title="Contribute"
                items={[
                  { label: "Character Pages", href: "/wiki/characters" },
                  { label: "Business Pages", href: "/wiki/businesses" },
                  { label: "Locations", href: "/wiki/locations" },
                  { label: "Style Guide", href: "#" },
                ]}
              />
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            {page?.infobox && <WikiInfobox box={page.infobox} />}
            <RecentChanges />
          </aside>
        </div>
      </div>
    </Layout>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4 pb-2 border-b border-line relative">
      <h2 className="font-display font-bold text-white text-xl md:text-2xl tracking-tight">{title}</h2>
      {subtitle && <p className="text-sm text-zinc-400 mt-0.5">{subtitle}</p>}
      <span className="absolute left-0 -bottom-px h-[2px] w-16 bg-pulse-600" />
    </div>
  );
}

function HeaderBtn({ children, icon, href }: { children: React.ReactNode; icon: React.ReactNode; href?: string }) {
  const cls = "inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded-md border border-line bg-panel2 hover:bg-panel hover:border-pulse-700/60 text-zinc-300 hover:text-white transition";
  if (href) return <Link href={href} className={cls}>{icon}{children}</Link>;
  return <button className={cls}>{icon}{children}</button>;
}

function CommunityCard({
  icon, title, items,
}: {
  icon: React.ReactNode;
  title: string;
  items: { label: string; href: string }[];
}) {
  return (
    <div className="panel p-4">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-line">
        <span className="text-pulse-500">{icon}</span>
        <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wide">{title}</h3>
      </div>
      <ul className="grid grid-cols-2 gap-1.5">
        {items.map((it) => (
          <li key={it.label}>
            <Link href={it.href} className="block px-3 py-2 rounded-md text-sm text-zinc-300 hover:text-white hover:bg-panel2 border border-transparent hover:border-line transition">
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}