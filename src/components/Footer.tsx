import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-line bg-panel/50">
      <div className="h-[2px] bg-gradient-to-r from-transparent via-pulse-700 to-transparent" />
      <div className="mx-auto max-w-[1500px] px-4 py-8 grid gap-8 md:grid-cols-4">
        <div>
          <Logo />
          <p className="text-sm text-zinc-400 mt-3 max-w-xs">
            The official community wiki for Pulse RP — a serious FiveM roleplay community
            built on storytelling, depth, and player-driven worldbuilding.
          </p>
        </div>
        <FooterCol title="Wiki">
          <FooterLink href="/">Main Page</FooterLink>
          <FooterLink href="/wiki/all-pages">All Pages</FooterLink>
          <FooterLink href="/wiki/recent-changes">Recent Changes</FooterLink>
          <FooterLink href="/wiki/community">Community Portal</FooterLink>
        </FooterCol>
        <FooterCol title="Community">
          <FooterLink href="/wiki/server-rules">Server Rules</FooterLink>
          <FooterLink href="/wiki/getting-started">Getting Started</FooterLink>
          <FooterLink href="/wiki/application-process">Apply</FooterLink>
          <FooterLink href="#">Discord</FooterLink>
        </FooterCol>
        <FooterCol title="Departments">
          <FooterLink href="/wiki/los-santos-police-department">LSPD</FooterLink>
          <FooterLink href="/wiki/blaine-county-sheriffs-office">BCSO</FooterLink>
          <FooterLink href="/wiki/san-andreas-state-police">SASP</FooterLink>
          <FooterLink href="/wiki/ems-medical">EMS</FooterLink>
        </FooterCol>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto max-w-[1500px] px-4 py-4 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
          <span>© {new Date().getFullYear()} Pulse Roleplay. Not affiliated with Rockstar Games or Take-Two Interactive.</span>
          <div className="flex items-center gap-4">
            <Link href="/wiki/server-rules" className="hover:text-zinc-300">Rules</Link>
            <a href="#" className="hover:text-zinc-300">Privacy</a>
            <a href="#" className="hover:text-zinc-300">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="font-display font-semibold text-white text-sm uppercase tracking-wider mb-3">{title}</h4>
      <ul className="space-y-1.5 text-sm">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-zinc-400 hover:text-pulse-400">{children}</Link>
    </li>
  );
}
