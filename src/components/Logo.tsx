import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 group">
      <div className="relative w-11 h-11 rounded-md overflow-hidden flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/pulse-rp-logo.png"
          alt="Pulse RP"
          className="w-full h-full object-contain"
        />
      </div>
      <div className="leading-tight">
        <div className="font-display font-bold text-white tracking-tight">
          Pulse <span className="text-pulse-500">RP</span>
        </div>
        <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">Roleplay Wiki</div>
      </div>
    </Link>
  );
}
