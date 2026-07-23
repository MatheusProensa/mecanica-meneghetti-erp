"use client";

import { useState } from "react";

export interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode;
}

export default function Tabs({ tabs, defaultValue }: { tabs: TabItem[]; defaultValue?: string }) {
  const [ativo, setAtivo] = useState(defaultValue ?? tabs[0]?.value);
  const atual = tabs.find((t) => t.value === ativo) ?? tabs[0];

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setAtivo(t.value)}
            className={`shrink-0 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
              ativo === t.value
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-gray-600 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-4">{atual?.content}</div>
    </div>
  );
}
