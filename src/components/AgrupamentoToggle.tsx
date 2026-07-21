"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Agrupamento } from "./DashboardCharts";

const PERIODO_PADRAO: Record<Agrupamento, string> = {
  diario: "30",
  semanal: "8",
  mensal: "6",
};

const AGRUPAMENTOS: { value: Agrupamento; label: string }[] = [
  { value: "diario", label: "Diário" },
  { value: "semanal", label: "Semanal" },
  { value: "mensal", label: "Mensal" },
];

export default function AgrupamentoToggle({
  agrupamento,
  personalizado,
  de,
  ate,
}: {
  agrupamento: Agrupamento;
  personalizado: boolean;
  de?: string;
  ate?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [deInput, setDeInput] = useState(de ?? "");
  const [ateInput, setAteInput] = useState(ate ?? "");

  function navegar(params: URLSearchParams) {
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handleAgrupamentoChange(next: Agrupamento) {
    if (next === agrupamento && !personalizado) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("agrupamento", next);
    params.set("periodo", PERIODO_PADRAO[next]);
    params.delete("de");
    params.delete("ate");
    navegar(params);
  }

  function handlePersonalizado() {
    if (personalizado) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("agrupamento", agrupamento);
    params.set("periodo", "personalizado");
    params.delete("de");
    params.delete("ate");
    navegar(params);
  }

  function handleAplicarPersonalizado() {
    if (!deInput || !ateInput) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("agrupamento", agrupamento);
    params.set("periodo", "personalizado");
    params.set("de", deInput);
    params.set("ate", ateInput);
    navegar(params);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex rounded-md border border-gray-200 bg-white p-0.5 text-xs font-medium">
        {AGRUPAMENTOS.map((a) => (
          <button
            key={a.value}
            type="button"
            onClick={() => handleAgrupamentoChange(a.value)}
            className={`rounded px-2.5 py-1 transition-colors ${
              agrupamento === a.value && !personalizado
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {a.label}
          </button>
        ))}
        <button
          type="button"
          onClick={handlePersonalizado}
          className={`rounded px-2.5 py-1 transition-colors ${
            personalizado ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Personalizado
        </button>
      </div>

      {personalizado && (
        <div className="flex flex-wrap items-center gap-1.5">
          <input
            type="date"
            value={deInput}
            onChange={(e) => setDeInput(e.target.value)}
            aria-label="De"
            className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <span className="text-xs text-gray-400">até</span>
          <input
            type="date"
            value={ateInput}
            onChange={(e) => setAteInput(e.target.value)}
            aria-label="Até"
            className="rounded-md border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={handleAplicarPersonalizado}
            disabled={!deInput || !ateInput}
            className="rounded-md bg-blue-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}
