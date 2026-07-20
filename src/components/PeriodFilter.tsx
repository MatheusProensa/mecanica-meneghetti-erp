"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Agrupamento } from "./DashboardCharts";

const OPCOES: Partial<Record<Agrupamento, { value: string; label: string }[]>> = {
  semanal: [
    { value: "4", label: "Últimas 4 semanas" },
    { value: "8", label: "Últimas 8 semanas" },
    { value: "12", label: "Últimas 12 semanas" },
    { value: "26", label: "Últimas 26 semanas" },
  ],
  mensal: [
    { value: "1", label: "Último mês" },
    { value: "3", label: "Últimos 3 meses" },
    { value: "6", label: "Últimos 6 meses" },
    { value: "12", label: "Últimos 12 meses" },
  ],
};

const PERIODO_PADRAO: Record<Agrupamento, string> = {
  diario: "1",
  semanal: "8",
  mensal: "6",
};

const AGRUPAMENTOS: { value: Agrupamento; label: string }[] = [
  { value: "diario", label: "Hoje" },
  { value: "semanal", label: "Semanal" },
  { value: "mensal", label: "Mensal" },
];

export default function PeriodFilter({
  agrupamento,
  periodo,
  de,
  ate,
}: {
  agrupamento: Agrupamento;
  periodo: string;
  de?: string;
  ate?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mostrarPersonalizado, setMostrarPersonalizado] = useState(periodo === "personalizado");
  const [deInput, setDeInput] = useState(de ?? "");
  const [ateInput, setAteInput] = useState(ate ?? "");

  function navegar(params: URLSearchParams) {
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function handleAgrupamentoChange(next: Agrupamento) {
    setMostrarPersonalizado(false);
    if (next === agrupamento && periodo !== "personalizado") return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("agrupamento", next);
    params.set("periodo", PERIODO_PADRAO[next]);
    params.delete("de");
    params.delete("ate");
    navegar(params);
  }

  function handlePeriodoChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("periodo", next);
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

  const opcoes = OPCOES[agrupamento];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex rounded-md border border-gray-200 bg-white p-0.5 text-xs font-medium">
        {AGRUPAMENTOS.map((a) => (
          <button
            key={a.value}
            type="button"
            onClick={() => handleAgrupamentoChange(a.value)}
            className={`rounded px-2.5 py-1 transition-colors ${
              agrupamento === a.value && !mostrarPersonalizado
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {a.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setMostrarPersonalizado(true)}
          className={`rounded px-2.5 py-1 transition-colors ${
            mostrarPersonalizado ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Personalizado
        </button>
      </div>

      {!mostrarPersonalizado && opcoes && (
        <select
          value={periodo}
          onChange={(e) => handlePeriodoChange(e.target.value)}
          className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          {opcoes.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}

      {mostrarPersonalizado && (
        <div className="flex items-center gap-1.5">
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
