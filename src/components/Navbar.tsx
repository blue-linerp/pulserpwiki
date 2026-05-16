"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import Search from "./Search";
import UserMenu from "./UserMenu";

const navLinks: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "Wiki", href: "/wiki/main-page" },
  { label: "Rules", href: "/wiki/server-rules" },
  { label: "Departments", href: "/wiki/departments" },
  { label: "Jobs", href: "/wiki/civilian-jobs" },
  { label: "Businesses", href: "/wiki/businesses" },
  { label: "Characters", href: "/wiki/characters" },
  { label: "Guides", href: "/wiki/getting-started" },
  { label: "Applications", href: "/wiki/application-process" },
];

function DiscordIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 127.14 96.36"
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21A105.73,105.73,0,0,0,32.71,96.36,77.7,77.7,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.25,105.25,0,0,0,126.6,80.22C129.24,52.84,122.09,29.11,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53S78.31,40.26,84.69,40.26,96.23,46,96.12,53,91.08,65.69,84.69,65.69Z" />
    </svg>
  );
}

export default function Navbar({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-bg/85 backdrop-blur border-b border-line">
      <div className="h-[3px] bg-gradient-to-r from-pulse-700 via-pulse-500 to-crimson" />
      <div className="mx-auto max-w-[1500px] px-3 md:px-5 h-14 flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-md hover:bg-panel2 border border-line text-zinc-300"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>
        <Logo />
        <div className="hidden md:flex flex-1 justify-center px-4">
          <Search />
        </div>
        <nav className="hidden xl:flex items-center gap-1 text-sm">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="px-2.5 py-1.5 rounded-md text-zinc-300 hover:text-white hover:bg-panel2 transition"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-2 ml-1">
          <a
            href="https://discord.gg/zabpTY2ARU"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#5865F2] border border-[#7983F5] text-white hover:bg-[#4752C4] hover:border-[#6875f5] shadow-[0_0_0_1px_rgba(88,101,242,0.22),0_8px_20px_rgba(88,101,242,0.18)] text-xs font-semibold transition"
          >
            <DiscordIcon className="w-4 h-4" /> Discord
          </a>
          <UserMenu />
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          className="xl:hidden ml-auto p-2 rounded-md hover:bg-panel2 border border-line text-zinc-300"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>
      {/* Mobile search row */}
      <div className="md:hidden px-3 pb-3">
        <Search compact />
      </div>
      {/* Mobile menu */}
      {open && (
        <div className="xl:hidden border-t border-line bg-panel">
          <nav className="px-3 py-2 grid grid-cols-2 gap-1 text-sm">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-md text-zinc-200 hover:bg-panel2"
              >
                {l.label}
              </Link>
            ))}
            <a href="https://discord.gg/zabpTY2ARU" className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#5865F2] border border-[#7983F5] text-white hover:bg-[#4752C4] font-semibold">
              <DiscordIcon className="w-4 h-4" /> Discord
            </a>
            <a href="/api/auth/steam" className="px-3 py-2 rounded-md bg-pulse-600 text-white text-center">Sign in with Steam</a>
          </nav>
        </div>
      )}
    </header>
  );
}
