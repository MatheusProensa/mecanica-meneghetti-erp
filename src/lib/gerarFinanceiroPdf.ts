import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { DadosEmpresa } from "./business";
import { formatCurrency, formatDate } from "./format";
import { carregarLogoComprimida } from "./pdfLogo";
import {
  desenharCabecalhoPdf,
  desenharResumoCardsPdf,
  desenharRodapePdf,
  PDF_MARGIN_X,
  TABLE_BODY_STYLES,
  TABLE_HEAD_STYLES,
} from "./pdfShell";

export interface ResumoFinanceiro {
  recebidoNoMes: number;
  aReceber: number;
  despesasTotal: number;
  funcionariosNoMes: number;
  lucroNoMes: number;
}

export interface DespesaLinha {
  id?: string;
  descricao: string;
  categoria: string | null;
  fornecedor: string | null;
  data: Date | string;
  valor: number;
}

export interface GerarFinanceiroPdfParams {
  empresa: DadosEmpresa;
  periodoLabel: string;
  resumo: ResumoFinanceiro;
  despesas: DespesaLinha[];
}

export async function gerarFinanceiroPdf({
  empresa,
  periodoLabel,
  resumo,
  despesas,
}: GerarFinanceiroPdfParams): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const logoBase64 = await carregarLogoComprimida();
  const emitidoEm = new Date().toLocaleDateString("pt-BR");
  let y = desenharCabecalhoPdf(doc, {
    titulo: "Relatório Financeiro",
    subtitulo: `${periodoLabel} · Emitido em ${emitidoEm}`,
    logoBase64,
  });

  y = desenharResumoCardsPdf(
    doc,
    [
      { label: "Recebido", valor: formatCurrency(resumo.recebidoNoMes) },
      { label: "A receber", valor: formatCurrency(resumo.aReceber) },
      { label: "Despesas", valor: formatCurrency(resumo.despesasTotal) },
      { label: "Funcionários", valor: formatCurrency(resumo.funcionariosNoMes) },
      { label: "Lucro no período", valor: formatCurrency(resumo.lucroNoMes), destaque: true },
    ],
    y
  );

  autoTable(doc, {
    startY: y + 10,
    margin: { left: PDF_MARGIN_X, right: PDF_MARGIN_X },
    head: [
      [
        "Descrição",
        "Categoria",
        "Fornecedor",
        "Data",
        { content: "Valor", styles: { halign: "right" } },
      ],
    ],
    body: despesas.map((d) => [
      d.descricao,
      d.categoria ?? "-",
      d.fornecedor ?? "-",
      formatDate(d.data),
      formatCurrency(d.valor),
    ]),
    headStyles: TABLE_HEAD_STYLES,
    columnStyles: {
      3: { cellWidth: 25 },
      4: { cellWidth: 28, halign: "right" },
    },
    styles: TABLE_BODY_STYLES,
    theme: "plain",
  });

  desenharRodapePdf(doc, `${empresa.nome} · ${empresa.endereco} · CNPJ ${empresa.cnpj}`);

  return doc;
}
