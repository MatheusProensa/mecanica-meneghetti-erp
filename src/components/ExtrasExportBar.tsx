"use client";

import { useState } from "react";
import ExportarExtrasCsv from "./ExportarExtrasCsv";
import ExportarExtrasPdf from "./ExportarExtrasPdf";
import type { ResumoExtras, ExtraLinha } from "@/lib/gerarExtrasPdf";
import type { DadosEmpresa } from "@/lib/business";

export default function ExtrasExportBar({
  empresa,
  periodoLabel,
  resumo,
  extras,
  nomeArquivoCsv,
  nomeArquivoPdf,
}: {
  empresa: DadosEmpresa;
  periodoLabel: string;
  resumo: ResumoExtras;
  extras: ExtraLinha[];
  nomeArquivoCsv: string;
  nomeArquivoPdf: string;
}) {
  const [mostrarFuncionario, setMostrarFuncionario] = useState(true);

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-end">
      <label className="flex items-center gap-1.5 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={mostrarFuncionario}
          onChange={(e) => setMostrarFuncionario(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
        />
        Mostrar funcionário
      </label>
      <ExportarExtrasCsv resumo={resumo} extras={extras} nomeArquivo={nomeArquivoCsv} mostrarFuncionario={mostrarFuncionario} />
      <ExportarExtrasPdf
        empresa={empresa}
        periodoLabel={periodoLabel}
        resumo={resumo}
        extras={extras}
        nomeArquivo={nomeArquivoPdf}
        mostrarFuncionario={mostrarFuncionario}
      />
    </div>
  );
}
