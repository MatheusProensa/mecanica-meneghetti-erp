"use client";

import { Download } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { SituacaoDivida } from "@/lib/dividas";

const SITUACAO_LABEL: Record<SituacaoDivida, string> = {
  em_aberto: "Em aberto",
  pagando: "Pagando",
  quitado: "Quitado",
};

interface Resumo {
  totalDividas: number;
  totalRecebido: number;
  saldoAReceber: number;
}

interface DividaLinha {
  clienteNome: string;
  dataServico: Date;
  valorOriginal: number;
  totalPago: number;
  saldo: number;
  situacao: SituacaoDivida;
}

function csvEscape(value: string): string {
  if (/[",\n;]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

function valorCsv(n: number): string {
  return n.toFixed(2).replace(".", ",");
}

export default function ExportarDevedoresCsv({
  resumo,
  dividas,
  nomeArquivo,
}: {
  resumo: Resumo;
  dividas: DividaLinha[];
  nomeArquivo: string;
}) {
  function exportar() {
    const linhas: string[] = [];

    linhas.push("Resumo");
    linhas.push(`Total em dívidas;${valorCsv(resumo.totalDividas)}`);
    linhas.push(`Recebido;${valorCsv(resumo.totalRecebido)}`);
    linhas.push(`Saldo a receber;${valorCsv(resumo.saldoAReceber)}`);
    linhas.push("");
    linhas.push("Cliente;Data do serviço;Valor original;Pago;Saldo;Situação");
    for (const d of dividas) {
      linhas.push(
        [
          csvEscape(d.clienteNome),
          formatDate(d.dataServico),
          valorCsv(d.valorOriginal),
          valorCsv(d.totalPago),
          valorCsv(d.saldo),
          SITUACAO_LABEL[d.situacao],
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
