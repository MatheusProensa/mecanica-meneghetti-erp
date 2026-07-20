"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { gerarOSPdf, type ResumoOS, type OSLinha } from "@/lib/gerarOSPdf";
import type { DadosEmpresa } from "@/lib/business";

export default function ExportarOSPdf({
  empresa,
  periodoLabel,
  resumo,
  ordens,
  nomeArquivo,
}: {
  empresa: DadosEmpresa;
  periodoLabel: string;
  resumo: ResumoOS;
  ordens: OSLinha[];
  nomeArquivo: string;
}) {
  const [gerando, setGerando] = useState(false);

  async function exportar() {
    setGerando(true);
    try {
      const doc = await gerarOSPdf({ empresa, periodoLabel, resumo, ordens });
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
