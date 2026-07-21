import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { DadosEmpresa } from "./business";
import { formatCurrency, formatDate } from "./format";
import { carregarLogoComprimida } from "./pdfLogo";
import {
  desenharCabecalhoPdf,
  desenharResumoCardsPdf,
  desenharRodapePdf,
  desenharTotalPdf,
  PDF_MARGIN_X,
  TABLE_BODY_STYLES,
  TABLE_HEAD_STYLES,
  up,
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
    subtitulo: `${periodoLabel} · ${emitidoEm}`,
    logoBase64,
  });

  y = desenharResumoCardsPdf(
    doc,
    [
      { label: "Recebido", valor: formatCurrency(resumo.recebidoNoMes) },
      { label: "A receber", valor: formatCurrency(resumo.aReceber) },
      { label: "Despesas", valor: formatCurrency(resumo.despesasTotal) },
      { label: "Lucro no período", valor: formatCurrency(resumo.lucroNoMes), destaque: true },
    ],
    y
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(31, 41, 55);
  doc.text("Despesas do período", PDF_MARGIN_X, y + 10);

  autoTable(doc, {
    startY: y + 15,
    margin: { left: PDF_MARGIN_X, right: PDF_MARGIN_X },
    head: [
      [
        up("Descrição"),
        up("Categoria"),
        up("Fornecedor"),
        up("Data"),
        { content: up("Valor"), styles: { halign: "right" } },
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable.finalY + 8;
  desenharTotalPdf(doc, {
    label: "Total de despesas",
    valor: formatCurrency(resumo.despesasTotal),
    y: finalY,
  });
  desenharRodapePdf(doc, `${empresa.nome} · ${empresa.endereco} · CNPJ ${empresa.cnpj}`);

  return doc;
}
