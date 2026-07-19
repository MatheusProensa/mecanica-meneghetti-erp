"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { gerarExtrasPdf, type ResumoExtras, type ExtraLinha } from "@/lib/gerarExtrasPdf";
import type { DadosEmpresa } from "@/lib/business";

export default function ExportarExtrasPdf({
  empresa,
  periodoLabel,
  resumo,
  extras,
  nomeArquivo,
}: {
  empresa: DadosEmpresa;
  periodoLabel: string;
  resumo: ResumoExtras;
  extras: ExtraLinha[];
  nomeArquivo: string;
}) {
  const [gerando, setGerando] = useState(false);

  async function exportar() {
    setGerando(true);
    try {
      const doc = await gerarExtrasPdf({ empresa, periodoLabel, resumo, extras });
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
      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
    >
      <FileDown className="h-4 w-4" />
      {gerando ? "Gerando..." : "Exportar PDF"}
    </button>
  );
}
