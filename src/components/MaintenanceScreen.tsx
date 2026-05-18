import { Wrench } from "lucide-react";

export default function MaintenanceScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="panel p-8 max-w-md text-center relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-pulse-700 via-pulse-500 to-crimson" />
        <div className="w-12 h-12 rounded-full bg-pulse-900/30 border border-pulse-700/50 flex items-center justify-center mx-auto mb-4">
          <Wrench className="w-5 h-5 text-pulse-400" />
        </div>
        <h1 className="font-display font-extrabold text-2xl text-white mb-2">
          Maintenance Mode
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed">
          The wiki is currently undergoing maintenance. We&apos;ll be back
          shortly — thanks for your patience.
        </p>
        <a
          href="/api/auth/steam"
          className="inline-block mt-5 text-[11px] uppercase tracking-wider text-zinc-500 hover:text-pulse-400"
        >
          Admin sign-in
        </a>
      </div>
    </div>
  );
}
