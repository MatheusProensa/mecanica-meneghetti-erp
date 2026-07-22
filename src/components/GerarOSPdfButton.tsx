"use client";

import { useState } from "react";
import { Printer } from "lucide-react";
import { gerarOrdemServicoPdf, type OrdemServicoItemPdf } from "@/lib/gerarOrdemServicoPdf";
import type { DadosEmpresa } from "@/lib/business";

export default function GerarOSPdfButton({
  empresa,
  cliente,
  os,
  itens,
}: {
  empresa: DadosEmpresa;
  cliente: { nome: string; telefone: string | null; endereco: string | null; cpfCnpj: string | null };
  os: {
    id: number;
    data: Date | string;
    statusLabel: string;
    mecanicoNome: string | null;
    previsaoEntrega: Date | string | null;
    formaPagamento: string | null;
    observacoes: string | null;
  };
  itens: OrdemServicoItemPdf[];
}) {
  const [gerando, setGerando] = useState(false);

  async function gerar() {
    setGerando(true);
    try {
      const doc = await gerarOrdemServicoPdf({ empresa, os, cliente, itens });
      doc.save(`os-${String(os.id).padStart(4, "0")}.pdf`);
    } finally {
      setGerando(false);
    }
  }

  return (
    <button
      type="button"
      onClick={gerar}
      disabled={gerando}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 disabled:opacity-60"
    >
      <Printer className="h-4 w-4" />
      {gerando ? "Gerando..." : "Imprimir OS"}
    </button>
  );
}
