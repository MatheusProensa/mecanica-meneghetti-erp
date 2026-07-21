"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { gerarCobrancaPdf } from "@/lib/gerarCobrancaPdf";
import type { DadosEmpresa } from "@/lib/business";

export default function GerarCobrancaOSButton({
  empresa,
  cliente,
  os,
  pixKeyPadrao,
  dadosBancariosPadrao,
}: {
  empresa: DadosEmpresa;
  cliente: { nome: string; telefone: string | null; endereco: string | null; cpfCnpj: string | null };
  os: { id: number; data: Date | string; descricao: string; valor: number };
  pixKeyPadrao: string | null;
  dadosBancariosPadrao: string | null;
}) {
  const [gerando, setGerando] = useState(false);

  async function gerar() {
    setGerando(true);
    try {
      const doc = await gerarCobrancaPdf({
        empresa,
        cliente,
        ordens: [os],
        pixKey: pixKeyPadrao,
        dadosBancarios: dadosBancariosPadrao,
        observacoes: null,
      });
      doc.save(`cobranca-os-${String(os.id).padStart(4, "0")}.pdf`);
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
      <FileDown className="h-4 w-4" />
      {gerando ? "Gerando..." : "Gerar cobrança PDF"}
    </button>
  );
}
