"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { Agrupamento } from "./DashboardCharts";

const OPCOES_MENSAL = [
  { value: "1", label: "Último mês" },
  { value: "3", label: "Últimos 3 meses" },
  { value: "6", label: "Últimos 6 meses" },
  { value: "12", label: "Últimos 12 meses" },
];

const OPCOES_SEMANAL = [
  { value: "4", label: "Últimas 4 semanas" },
  { value: "8", label: "Últimas 8 semanas" },
  { value: "12", label: "Últimas 12 semanas" },
  { value: "26", label: "Últimas 26 semanas" },
];

const PERIODO_PADRAO: Record<Agrupamento, string> = {
  mensal: "6",
  semanal: "8",
};

export default function PeriodFilter({
  agrupamento,
  periodo,
}: {
  agrupamento: Agrupamento;
  periodo: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handlePeriodoChange(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("periodo", next);
    router.push(`${pathname}?${params.toString()}`);
  }

  function handleAgrupamentoChange(next: Agrupamento) {
    if (next === agrupamento) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("agrupamento", next);
    params.set("periodo", PERIODO_PADRAO[next]);
    router.push(`${pathname}?${params.toString()}`);
  }

  const opcoes = agrupamento === "semanal" ? OPCOES_SEMANAL : OPCOES_MENSAL;

  return (
    <div className="flex items-center gap-2">
      <div className="flex rounded-md border border-gray-200 bg-white p-0.5 text-xs font-medium">
        <button
          type="button"
          onClick={() => handleAgrupamentoChange("mensal")}
          className={`rounded px-2.5 py-1 transition-colors ${
            agrupamento === "mensal"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Mensal
        </button>
        <button
          type="button"
          onClick={() => handleAgrupamentoChange("semanal")}
          className={`rounded px-2.5 py-1 transition-colors ${
            agrupamento === "semanal"
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Semanal
        </button>
      </div>
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
    </div>
  );
}
