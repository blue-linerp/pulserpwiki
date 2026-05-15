"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface BusinessInfoboxItem {
  label: string;
  value: React.ReactNode;
}

export interface BusinessInfoboxGroup {
  heading: string;
  items: BusinessInfoboxItem[];
}

export default function BusinessInfoboxBody({
  topFields,
  groups,
}: {
  topFields: BusinessInfoboxItem[];
  groups: BusinessInfoboxGroup[];
}) {
  return (
    <div>
      {topFields.length > 0 && (
        <table className="w-full text-[13px] table-fixed">
          <tbody>
            {topFields.map((f, i) => (
              <tr key={`top-${i}`} className="business-infobox-row">
                <td className="business-infobox-label">{f.label}</td>
                <td className="business-infobox-value">{f.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {groups.map((g, gi) => (
        <CollapsibleGroup key={`g-${gi}`} group={g} />
      ))}
    </div>
  );
}

function CollapsibleGroup({ group }: { group: BusinessInfoboxGroup }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="business-infobox-collapsible">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="business-infobox-section-toggle"
        aria-expanded={open}
      >
        <span>{group.heading}</span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${open ? "" : "-rotate-90"}`}
        />
      </button>
      {open && (
        <table className="w-full text-[13px] table-fixed">
          <tbody>
            {group.items.map((f, i) => (
              <tr key={`g-${i}`} className="business-infobox-row">
                <td className="business-infobox-label">{f.label}</td>
                <td className="business-infobox-value">{f.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
