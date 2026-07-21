"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, Share2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format";
import { gerarCobrancaPdf, type CobrancaOS } from "@/lib/gerarCobrancaPdf";
import type { DadosEmpresa } from "@/lib/business";

type NavigatorComShare = Navigator & {
  canShare?: (data: { files: File[] }) => boolean;
  share?: (data: { files: File[]; title?: string; text?: string }) => Promise<void>;
};

const DIACRITICOS_UNICODE_RANGE = String.fromCharCode(0x0300) + "-" + String.fromCharCode(0x036f);
const REGEX_DIACRITICOS = new RegExp(`[${DIACRITICOS_UNICODE_RANGE}]`, "g");

function nomeArquivo(nomeCliente: string) {
  const slug = nomeCliente
    .normalize("NFD")
    .replace(REGEX_DIACRITICOS, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `cobranca-${slug}-${new Date().toISOString().slice(0, 10)}.pdf`;
}

export default function CobrancaCliente({
  empresa,
  cliente,
  ordensAbertas,
  pixKeyPadrao,
  dadosBancariosPadrao,
}: {
  empresa: DadosEmpresa;
  cliente: {
    nome: string;
    telefone?: string | null;
    endereco?: string | null;
    cpfCnpj?: string | null;
  };
  ordensAbertas: CobrancaOS[];
  pixKeyPadrao: string | null;
  dadosBancariosPadrao: string | null;
}) {
  const [selecionadas, setSelecionadas] = useState<Set<number>>(
    new Set(ordensAbertas.map((os) => os.id))
  );
  const [incluirPix, setIncluirPix] = useState(Boolean(pixKeyPadrao || dadosBancariosPadrao));
  const [observacoes, setObservacoes] = useState("");
  const [gerando, setGerando] = useState<"baixar" | "compartilhar" | null>(null);

  function toggleOS(id: number) {
    setSelecionadas((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleTodas() {
    setSelecionadas((prev) =>
      prev.size === ordensAbertas.length ? new Set() : new Set(ordensAbertas.map((os) => os.id))
    );
  }

  const ordensSelecionadas = ordensAbertas.filter((os) => selecionadas.has(os.id));
  const totalSelecionado = ordensSelecionadas.reduce((sum, os) => sum + os.valor, 0);

  async function montarPdf() {
    return gerarCobrancaPdf({
      empresa,
      cliente,
      ordens: ordensSelecionadas,
      pixKey: incluirPix ? pixKeyPadrao : null,
      dadosBancarios: incluirPix ? dadosBancariosPadrao : null,
      observacoes: observacoes.trim() || null,
    });
  }

  async function handleBaixar() {
    setGerando("baixar");
    try {
      const doc = await montarPdf();
      doc.save(nomeArquivo(cliente.nome));
    } finally {
      setGerando(null);
    }
  }

  async function handleCompartilhar() {
    setGerando("compartilhar");
    try {
      const doc = await montarPdf();
      const blob = doc.output("blob") as Blob;
      const file = new File([blob], nomeArquivo(cliente.nome), { type: "application/pdf" });
      const nav = navigator as NavigatorComShare;

      if (nav.canShare?.({ files: [file] }) && nav.share) {
        await nav.share({
          files: [file],
          title: `Cobrança — ${cliente.nome}`,
          text: `Cobrança de serviços em aberto — ${cliente.nome}`,
        });
      } else {
        doc.save(nomeArquivo(cliente.nome));
      }
    } catch (e) {
      if ((e as Error)?.name !== "AbortError") {
        const doc = await montarPdf();
        doc.save(nomeArquivo(cliente.nome));
      }
    } finally {
      setGerando(null);
    }
  }

  if (ordensAbertas.length === 0) return null;

  const temDadosPagamento = Boolean(pixKeyPadrao || dadosBancariosPadrao);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-900">Gerar cobrança em PDF</h3>
        <button
          type="button"
          onClick={toggleTodas}
          className="shrink-0 text-xs font-medium text-brand-600 hover:underline"
        >
          {selecionadas.size === ordensAbertas.length ? "Limpar seleção" : "Selecionar todas"}
        </button>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        Escolha as ordens de serviço em aberto que entram na cobrança.
      </p>

      <div className="mt-3 divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-100">
        {ordensAbertas.map((os) => (
          <label
            key={os.id}
            className="flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm hover:bg-gray-50"
          >
            <input
              type="checkbox"
              checked={selecionadas.has(os.id)}
              onChange={() => toggleOS(os.id)}
              className="h-4 w-4 shrink-0 rounded border-gray-300 text-brand-600 focus:ring-blue-500"
            />
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-gray-900">
                #{String(os.id).padStart(4, "0")} — {formatDate(os.data)}
              </span>
              <span className="block truncate text-xs text-gray-500">{os.descricao || "-"}</span>
            </span>
            <span className="shrink-0 text-sm font-medium text-gray-900">
              {formatCurrency(os.valor)}
            </span>
          </label>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
        <span className="text-sm text-gray-600">Total selecionado</span>
        <span className="text-sm font-semibold text-gray-900">
          {formatCurrency(totalSelecionado)}
        </span>
      </div>

      {temDadosPagamento ? (
        <div className="mt-3">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={incluirPix}
              onChange={(e) => setIncluirPix(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-blue-500"
            />
            Incluir dados de pagamento no PDF
          </label>
          {incluirPix && (
            <div className="mt-1.5 space-y-1 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-600">
              {pixKeyPadrao && (
                <p>
                  Chave Pix: {pixKeyPadrao}{" "}
                  <span className="text-gray-400">(QR Code entra automaticamente)</span>
                </p>
              )}
              {dadosBancariosPadrao && (
                <p className="whitespace-pre-line">{dadosBancariosPadrao}</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="mt-3 text-xs text-gray-500">
          Nenhum dado de pagamento cadastrado.{" "}
          <Link href="/configuracoes?secao=cobranca" className="text-brand-600 hover:underline">
            Cadastrar em Configurações
          </Link>
        </p>
      )}

      <div className="mt-3">
        <label htmlFor="observacoesCobranca" className="block text-sm font-medium text-gray-700">
          Observações (opcional)
        </label>
        <textarea
          id="observacoesCobranca"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          rows={2}
          placeholder="Ex: cobrança referente aos serviços de junho"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={handleBaixar}
          disabled={selecionadas.size === 0 || gerando !== null}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-60 sm:w-auto"
        >
          <Download className="h-4 w-4" />
          {gerando === "baixar" ? "Gerando..." : "Baixar PDF"}
        </button>
        <button
          type="button"
          onClick={handleCompartilhar}
          disabled={selecionadas.size === 0 || gerando !== null}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60 sm:w-auto"
        >
          <Share2 className="h-4 w-4" />
          {gerando === "compartilhar" ? "Gerando..." : "Compartilhar"}
        </button>
      </div>
    </div>
  );
}
