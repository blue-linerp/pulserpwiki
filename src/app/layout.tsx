import type { Metadata } from "next";
import "@/styles/globals.css";
import { headers } from "next/headers";
import { getSettings } from "@/lib/siteSettings";
import { getCurrentUser } from "@/lib/auth";
import MaintenanceScreen from "@/components/MaintenanceScreen";

export const metadata: Metadata = {
  title: "Pulse RP Wiki — The Pulse Roleplay Community Wiki",
  description:
    "The official community wiki for Pulse RP, a serious FiveM roleplay server. Departments, jobs, businesses, characters, lore, rules, and guides.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Maintenance mode gate: when feature:maintenance=1, hide the site from
  // everyone except admins. Admin and auth API routes remain accessible so
  // admins can flip the toggle back off.
  const settings = await getSettings();
  const maintenance = settings["feature:maintenance"] === "1";
  let blocked = false;
  if (maintenance) {
    const me = await getCurrentUser();
    if (!me || me.role !== "admin") {
      const path = headers().get("x-invoke-path") ?? "";
      if (!path.startsWith("/admin") && !path.startsWith("/api/") && path !== "/maintenance") {
        blocked = true;
      }
    }
  }
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/pulse-rp-logo.png?v=2" />
        <link rel="shortcut icon" type="image/png" href="/pulse-rp-logo.png?v=2" />
        <link rel="apple-touch-icon" href="/pulse-rp-logo.png?v=2" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Rubik:wght@500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-bg text-zinc-100 antialiased" suppressHydrationWarning>
        {blocked ? <MaintenanceScreen /> : children}
      </body>
    </html>
  );
}
