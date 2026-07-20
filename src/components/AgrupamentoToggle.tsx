"use client";

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
}: {
  agrupamento: Agrupamento;
  personalizado: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  return (
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
  );
}
