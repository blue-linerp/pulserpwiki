import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Pulse RP Wiki — The Pulse Roleplay Community Wiki",
  description:
    "The official community wiki for Pulse RP, a serious FiveM roleplay server. Departments, jobs, businesses, characters, lore, rules, and guides.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
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
      <body className="bg-bg text-zinc-100 antialiased">{children}</body>
    </html>
  );
}
