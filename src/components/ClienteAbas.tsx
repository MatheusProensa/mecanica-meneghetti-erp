"use client";

import { useRef, useState } from "react";

type Aba = "historico" | "dividas" | "notas";

export default function ClienteAbas({
  historico,
  dividas,
  notas,
}: {
  historico: React.ReactNode;
  dividas?: React.ReactNode;
  notas: React.ReactNode;
}) {
  const [aba, setAba] = useState<Aba>("historico");
  const barraRef = useRef<HTMLDivElement>(null);

  const abas: { value: Aba; label: string }[] = [
    { value: "historico", label: "Histórico de OS" },
    ...(dividas ? ([{ value: "dividas", label: "Dívidas antigas" }] as const) : []),
    { value: "notas", label: "Notas" },
  ];

  function trocarAba(value: Aba) {
    setAba(value);
    // Sem isso, ao trocar pra uma aba mais curta o navegador "puxa" a rolagem
    // pro topo abruptamente (a página não tem mais altura pra manter a posição).
    barraRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  return (
    <div>
      <div ref={barraRef} className="flex gap-1 overflow-x-auto border-b border-gray-200">
        {abas.map((a) => (
          <button
            key={a.value}
            type="button"
            onClick={() => trocarAba(a.value)}
            className={`shrink-0 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
              aba === a.value
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-gray-600 hover:text-gray-700"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {aba === "historico" && historico}
        {aba === "dividas" && dividas}
        {aba === "notas" && notas}
      </div>
    </div>
  );
}
