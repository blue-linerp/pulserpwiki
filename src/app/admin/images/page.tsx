import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Layout from "@/components/Layout";
import ImageExplorer from "@/components/ImageExplorer";

export const dynamic = "force-dynamic";

export default function AdminImagesPage() {
  const me = getCurrentUser();
  if (!me) redirect("/api/auth/steam");
  if (me.role !== "admin") {
    return (
      <Layout>
        <div className="panel p-6 text-center text-zinc-300">
          <h1 className="text-lg font-display font-semibold text-white mb-1">Forbidden</h1>
          <p className="text-sm text-zinc-400">You need admin privileges to view this page.</p>
        </div>
      </Layout>
    );
  }
  return (
    <Layout>
      <ImageExplorer />
    </Layout>
  );
}
