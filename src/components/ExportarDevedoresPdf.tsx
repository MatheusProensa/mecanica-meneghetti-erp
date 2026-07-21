"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { gerarDevedoresPdf, type ResumoDevedores, type DividaLinha } from "@/lib/gerarDevedoresPdf";
import type { DadosEmpresa } from "@/lib/business";

export default function ExportarDevedoresPdf({
  empresa,
  periodoLabel,
  resumo,
  dividas,
  nomeArquivo,
}: {
  empresa: DadosEmpresa;
  periodoLabel: string;
  resumo: ResumoDevedores;
  dividas: DividaLinha[];
  nomeArquivo: string;
}) {
  const [gerando, setGerando] = useState(false);

  async function exportar() {
    setGerando(true);
    try {
      const doc = await gerarDevedoresPdf({ empresa, periodoLabel, resumo, dividas });
      doc.save(nomeArquivo);
    } finally {
      setGerando(false);
    }
  }

  return (
    <button
      type="button"
      onClick={exportar}
      disabled={gerando}
      className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
    >
      <FileDown className="h-4 w-4" />
      {gerando ? "Gerando..." : "Exportar PDF"}
    </button>
  );
}
