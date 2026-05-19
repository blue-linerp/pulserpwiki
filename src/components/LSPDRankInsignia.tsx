/**
 * LSPDRankInsignia — renders a single LSPD rank insignia image.
 * Usage in wiki content (after template processing): <lspd-rank code="cop" size="25" />
 *
 * LSPDRankTable — full reference table, used on the Template:LSPDRank page.
 */

import { resolveLspdRank, LSPD_RANKS } from "@/data/lspdRanks";

interface InsigniaProps {
  /** Shortcode or alias, e.g. "cop", "chief", "sgt", "sergeant" */
  code: string;
  /** Override width in px */
  size?: number;
  className?: string;
}

export function LSPDRankInsignia({ code, size, className }: InsigniaProps) {
  const rank = resolveLspdRank(code);
  if (!rank) return <span className="text-xs text-zinc-500 italic">[unknown rank: {code}]</span>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={rank.imageUrl}
      alt={rank.label}
      title={rank.label}
      width={size ?? rank.width}
      className={className ?? "inline-block"}
    />
  );
}

/** Full reference table — render this on the Template:LSPDRank wiki page */
export function LSPDRankTable() {
  const ranks = Object.entries(LSPD_RANKS);
  return (
    <div className="overflow-x-auto">
      <table className="wiki-table w-full text-sm">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Insignia</th>
            <th className="text-left">Shortcodes</th>
          </tr>
        </thead>
        <tbody>
          {ranks.map(([key, rank]) => (
            <tr key={key}>
              <td className="font-bold">{rank.label}</td>
              <td>
                <LSPDRankInsignia code={key} />
              </td>
              <td className="text-left font-mono text-xs text-zinc-300 space-y-0.5">
                <div>
                  {[key, ...rank.aliases].map((a) => (
                    <span key={a} className="inline-block mr-2 px-1.5 py-0.5 bg-panel2 border border-line rounded text-pulse-300">
                      {`{{LSPDRank|${a}}}`}
                    </span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}