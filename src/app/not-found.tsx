import Link from "next/link";
import Layout from "@/components/Layout";

export default function NotFound() {
  return (
    <Layout>
      <div className="panel p-10 text-center">
        <p className="text-pulse-500 text-xs uppercase tracking-[0.2em]">404</p>
        <h1 className="font-display font-extrabold text-3xl md:text-4xl text-white mt-2">Page Not Found</h1>
        <p className="text-zinc-400 mt-2">The page you’re looking for doesn’t exist or hasn’t been written yet.</p>
        <Link href="/" className="inline-block mt-6 px-4 py-2 rounded-md bg-pulse-600 hover:bg-pulse-500 text-white text-sm font-semibold border border-pulse-500/60 shadow-glow">
          Return to Main Page
        </Link>
      </div>
    </Layout>
  );
}
