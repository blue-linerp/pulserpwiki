import nextDynamic from "next/dynamic";
import type { Metadata } from "next";
import Layout from "@/components/Layout";
import Breadcrumbs from "@/components/Breadcrumbs";
import PageDisabledNotice from "@/components/PageDisabledNotice";
import { getSettings, isPageEnabled } from "@/lib/siteSettings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Map: Los Santos — Pulse RP Wiki",
  description:
    "Interactive map of Los Santos and Blaine County in Pulse RP. Browse landmarks, departments, businesses and key locations.",
};

const MapView = nextDynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => (
    <div className="h-[78vh] min-h-[480px] rounded-md border border-line bg-panel2 flex items-center justify-center text-sm text-zinc-500">
      Loading map…
    </div>
  ),
});

const MapEditor = nextDynamic(() => import("@/components/MapEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-[78vh] min-h-[480px] rounded-md border border-line bg-panel2 flex items-center justify-center text-sm text-zinc-500">
      Loading editor…
    </div>
  ),
});

export default async function MapPage({
  searchParams,
}: {
  searchParams?: { action?: string };
}) {
  const settings = await getSettings();
  if (!isPageEnabled(settings, "map")) {
    return (
      <Layout>
        <PageDisabledNotice />
      </Layout>
    );
  }

  const editing = searchParams?.action === "mapedit";

  return (
    <Layout>
      <div className="space-y-4">
        <Breadcrumbs
          items={[
            { label: "Map: Los Santos", href: editing ? "/wiki/map" : undefined },
            ...(editing ? [{ label: "Editor" }] : []),
          ]}
        />
        {editing ? <MapEditor /> : <MapView />}
      </div>
    </Layout>
  );
}
