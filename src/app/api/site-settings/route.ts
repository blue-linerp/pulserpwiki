/**
 * Public read-only site settings endpoint. Consumed by client components
 * (Sidebar, Navbar) that need to know which sections/features to show.
 *
 * Mutations go through /api/admin/settings (admin only).
 */
import { NextResponse } from "next/server";
import { getSettings } from "@/lib/siteSettings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json({ settings });
}
