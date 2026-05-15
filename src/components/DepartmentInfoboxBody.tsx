"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface DepartmentInfoboxItem {
  label: string;
  value: React.ReactNode;
}

export interface DepartmentInfoboxGroup {
  heading: string;
  items: DepartmentInfoboxItem[];
}

export default function DepartmentInfoboxBody({
  topFields,
  groups,
}: {
  topFields: DepartmentInfoboxItem[];
  groups: DepartmentInfoboxGroup[];
}) {
  return (
    <div>
      {topFields.length > 0 && (
        <table className="w-full text-[13px] table-fixed">
          <tbody>
            {topFields.map((f, i) => (
              <tr key={`top-${i}`} className="department-infobox-row">
                <td className="department-infobox-label">{f.label}</td>
                <td className="department-infobox-value">{f.value}</td>
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

function CollapsibleGroup({ group }: { group: DepartmentInfoboxGroup }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="department-infobox-collapsible">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="department-infobox-section-toggle"
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
              <tr key={`g-${i}`} className="department-infobox-row">
                <td className="department-infobox-label">{f.label}</td>
                <td className="department-infobox-value">{f.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
