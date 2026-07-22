"use client";

import { useState, useTransition } from "react";
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

type Selecao = Agrupamento | "personalizado";

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
  const [, startTransition] = useTransition();

  // Seleção "otimista": destaca o botão clicado na hora, sem esperar a
  // navegação (que revalida os dados no servidor) terminar.
  const selecaoAtual: Selecao = personalizado ? "personalizado" : agrupamento;
  const [selecaoOtimista, setSelecaoOtimista] = useState<Selecao | null>(null);

  // Descarta o valor otimista assim que os dados reais do servidor alcançarem
  // o clique (ajuste de estado durante a renderização, não em efeito).
  const [selecaoAtualAnterior, setSelecaoAtualAnterior] = useState(selecaoAtual);
  if (selecaoAtual !== selecaoAtualAnterior) {
    setSelecaoAtualAnterior(selecaoAtual);
    setSelecaoOtimista(null);
  }

  const selecao = selecaoOtimista ?? selecaoAtual;

  function navegar(params: URLSearchParams) {
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  function handleAgrupamentoChange(next: Agrupamento) {
    if (next === agrupamento && !personalizado) return;
    setSelecaoOtimista(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("agrupamento", next);
    params.set("periodo", PERIODO_PADRAO[next]);
    params.delete("de");
    params.delete("ate");
    navegar(params);
  }

  function handlePersonalizado() {
    if (personalizado) return;
    setSelecaoOtimista("personalizado");
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
      <div className="flex rounded-lg border border-gray-200 bg-white p-1 text-xs font-medium shadow-[var(--shadow-card)]">
        {AGRUPAMENTOS.map((a) => (
          <button
            key={a.value}
            type="button"
            onClick={() => handleAgrupamentoChange(a.value)}
            className={`rounded-md px-2.5 py-1.5 transition-all duration-150 ease-out active:scale-95 ${
              selecao === a.value
                ? "bg-brand-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {a.label}
          </button>
        ))}
        <button
          type="button"
          onClick={handlePersonalizado}
          className={`rounded-md px-2.5 py-1.5 transition-all duration-150 ease-out active:scale-95 ${
            selecao === "personalizado" ? "bg-brand-600 text-white shadow-sm" : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          Personalizado
        </button>
      </div>

      <div
        className={`flex flex-nowrap items-center gap-1 overflow-hidden transition-all duration-300 ease-out sm:gap-1.5 ${
          personalizado ? "max-w-[min(94vw,28rem)] opacity-100" : "max-w-0 opacity-0"
        }`}
      >
        <input
          type="date"
          value={deInput}
          onChange={(e) => setDeInput(e.target.value)}
          aria-label="De"
          tabIndex={personalizado ? 0 : -1}
          className="w-[126px] shrink-0 rounded-md border border-gray-200 bg-white px-1.5 py-1.5 text-xs text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-auto sm:px-2"
        />
        <span className="shrink-0 text-xs text-gray-500">até</span>
        <input
          type="date"
          value={ateInput}
          onChange={(e) => setAteInput(e.target.value)}
          aria-label="Até"
          tabIndex={personalizado ? 0 : -1}
          className="w-[126px] shrink-0 rounded-md border border-gray-200 bg-white px-1.5 py-1.5 text-xs text-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:w-auto sm:px-2"
        />
        <button
          type="button"
          onClick={handleAplicarPersonalizado}
          disabled={!deInput || !ateInput}
          tabIndex={personalizado ? 0 : -1}
          className="shrink-0 rounded-md bg-brand-600 px-2 py-1.5 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50 sm:px-2.5"
        >
          Aplicar
        </button>
      </div>
    </div>
  );
}
