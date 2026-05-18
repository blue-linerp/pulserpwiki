/**
 * Shared "Coming Soon" panel shown when a wiki page has been disabled
 * via the admin Site Settings panel.
 */
export default function PageDisabledNotice() {
  return (
    <div className="panel p-16 text-center space-y-4">
      <p className="text-pulse-500 text-xs uppercase tracking-[0.2em]">Coming Soon</p>
      <h1 className="font-display font-extrabold text-3xl text-white">
        This page is not yet available
      </h1>
      <p className="text-zinc-400 text-sm">
        This section of the wiki is still being written. Check back soon.
      </p>
      <a
        href="/"
        className="inline-block mt-4 px-4 py-2 rounded-md bg-pulse-600 hover:bg-pulse-500 text-white text-sm font-semibold border border-pulse-500/60 shadow-glow"
      >
        Return to Main Page
      </a>
    </div>
  );
}
