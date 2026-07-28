"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { gerarExtratoDividaPdf, type ExtratoDividaItem, type ExtratoDividaPagamento } from "@/lib/gerarExtratoDividaPdf";
import type { DadosEmpresa } from "@/lib/business";

const DIACRITICOS_UNICODE_RANGE = String.fromCharCode(0x0300) + "-" + String.fromCharCode(0x036f);
const REGEX_DIACRITICOS = new RegExp(`[${DIACRITICOS_UNICODE_RANGE}]`, "g");

export default function GerarExtratoDividaPdfButton({
  empresa,
  cliente,
  situacaoLabel,
  itens,
  pagamentos,
}: {
  empresa: DadosEmpresa;
  cliente: { nome: string; telefone: string | null; endereco: string | null; cpfCnpj: string | null };
  situacaoLabel: string;
  itens: ExtratoDividaItem[];
  pagamentos: ExtratoDividaPagamento[];
}) {
  const [gerando, setGerando] = useState(false);

  async function gerar() {
    setGerando(true);
    try {
      const doc = await gerarExtratoDividaPdf({ empresa, cliente, situacaoLabel, itens, pagamentos });
      const slug = cliente.nome
        .normalize("NFD")
        .replace(REGEX_DIACRITICOS, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase();
      doc.save(`extrato-divida-${slug}.pdf`);
    } finally {
      setGerando(false);
    }
  }

  return (
    <button
      type="button"
      onClick={gerar}
      disabled={gerando}
      className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
    >
      <FileDown className="h-4 w-4" />
      {gerando ? "Gerando..." : "Gerar PDF"}
    </button>
  );
}
