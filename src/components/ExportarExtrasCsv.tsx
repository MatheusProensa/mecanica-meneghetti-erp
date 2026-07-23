"use client";

import { Download } from "lucide-react";
import { formatDate } from "@/lib/format";
import type { StatusExtra } from "@/lib/extras";

const STATUS_LABEL: Record<StatusExtra, string> = {
  pendente: "Pendente",
  parcialmente_pago: "Parcialmente pago",
  pago: "Pago",
};

interface Resumo {
  totalExtras: number;
  totalPago: number;
  faltaPagar: number;
  lucroEmpresa: number;
}

interface ExtraLinha {
  data: Date;
  mecanicoNome: string;
  clienteOuOs: string;
  descricao: string;
  valorExtra: number;
  saldo: number;
  lucroEmpresa: number;
  status: StatusExtra;
}

function csvEscape(value: string): string {
  // Evita injeção de fórmula: se abrir com =, +, -, @ etc., o Excel pode
  // interpretar como fórmula executável ao abrir o arquivo exportado.
  const seguro = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  if (/[",\n;]/.test(seguro)) return `"${seguro.replace(/"/g, '""')}"`;
  return seguro;
}

function valorCsv(n: number): string {
  return n.toFixed(2).replace(".", ",");
}

export default function ExportarExtrasCsv({
  resumo,
  extras,
  nomeArquivo,
}: {
  resumo: Resumo;
  extras: ExtraLinha[];
  nomeArquivo: string;
}) {
  function exportar() {
    const linhas: string[] = [];

    linhas.push("Resumo");
    linhas.push(`Total de extras;${valorCsv(resumo.totalExtras)}`);
    linhas.push(`Já pago;${valorCsv(resumo.totalPago)}`);
    linhas.push(`Falta pagar;${valorCsv(resumo.faltaPagar)}`);
    linhas.push(`Lucro da empresa;${valorCsv(resumo.lucroEmpresa)}`);
    linhas.push("");
    linhas.push("Data;Funcionário;Cliente / OS;Descrição;Extra;Saldo;Lucro;Situação");
    for (const e of extras) {
      linhas.push(
        [
          formatDate(e.data),
          csvEscape(e.mecanicoNome),
          csvEscape(e.clienteOuOs),
          csvEscape(e.descricao),
          valorCsv(e.valorExtra),
          valorCsv(e.saldo),
          valorCsv(e.lucroEmpresa),
          STATUS_LABEL[e.status],
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
