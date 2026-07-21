"use client";

import { Download } from "lucide-react";
import { formatDate } from "@/lib/format";

interface Resumo {
  recebidoNoMes: number;
  aReceber: number;
  despesasTotal: number;
  funcionariosNoMes: number;
  lucroNoMes: number;
}

interface DespesaLinha {
  id?: string;
  descricao: string;
  categoria: string | null;
  fornecedor: string | null;
  data: Date;
  valor: number;
}

function csvEscape(value: string): string {
  if (/[",\n;]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function valorCsv(n: number): string {
  return n.toFixed(2).replace(".", ",");
}

export default function ExportarFinanceiroCsv({
  resumo,
  despesas,
  nomeArquivo,
}: {
  resumo: Resumo;
  despesas: DespesaLinha[];
  nomeArquivo: string;
}) {
  function exportar() {
    const linhas: string[] = [];

    linhas.push("Resumo do período");
    linhas.push(`Recebido no mês;${valorCsv(resumo.recebidoNoMes)}`);
    linhas.push(`A receber;${valorCsv(resumo.aReceber)}`);
    linhas.push(`Despesas no mês;${valorCsv(resumo.despesasTotal)}`);
    linhas.push(`Funcionários no mês;${valorCsv(resumo.funcionariosNoMes)}`);
    linhas.push(`Lucro no mês;${valorCsv(resumo.lucroNoMes)}`);
    linhas.push("");
    linhas.push("Despesas");
    linhas.push("Descrição;Categoria;Fornecedor;Data;Valor");
    for (const d of despesas) {
      linhas.push(
        [
          csvEscape(d.descricao),
          csvEscape(d.categoria ?? ""),
          csvEscape(d.fornecedor ?? ""),
          formatDate(d.data),
          valorCsv(d.valor),
        ].join(";")
      );
    }

    const csv = "﻿" + linhas.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nomeArquivo;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={exportar}
      className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
    >
      <Download className="h-4 w-4" />
      Exportar CSV
    </button>
  );
}
