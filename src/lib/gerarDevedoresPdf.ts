import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { DadosEmpresa } from "./business";
import { formatCurrency, formatDate } from "./format";
import { carregarLogoComprimida } from "./pdfLogo";
import type { SituacaoDivida } from "./dividas";
import {
  criarColunaBadgePdf,
  desenharCabecalhoPdf,
  desenharResumoCardsPdf,
  desenharRodapePdf,
  desenharTotalPdf,
  PDF_MARGIN_X,
  TABLE_BODY_STYLES,
  TABLE_HEAD_STYLES,
  up,
  type PdfBadgeTone,
} from "./pdfShell";

const SITUACAO_LABEL: Record<SituacaoDivida, string> = {
  em_aberto: "Em aberto",
  pagando: "Pagando",
  quitado: "Quitado",
};

const SITUACAO_TONE: Record<string, PdfBadgeTone> = {
  "Em aberto": "red",
  Pagando: "amber",
  Quitado: "green",
};

export interface ResumoDevedores {
  totalDividas: number;
  totalRecebido: number;
  saldoAReceber: number;
}

export interface DividaLinha {
  clienteNome: string;
  dataServico: Date | string;
  valorOriginal: number;
  totalPago: number;
  saldo: number;
  situacao: SituacaoDivida;
}

export interface GerarDevedoresPdfParams {
  empresa: DadosEmpresa;
  periodoLabel: string;
  resumo: ResumoDevedores;
  dividas: DividaLinha[];
}

export async function gerarDevedoresPdf({
  empresa,
  periodoLabel,
  resumo,
  dividas,
}: GerarDevedoresPdfParams): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const logoBase64 = await carregarLogoComprimida();
  const emitidoEm = new Date().toLocaleDateString("pt-BR");
  let y = desenharCabecalhoPdf(doc, {
    titulo: "Relatório de Devedores",
    subtitulo: periodoLabel ? `${periodoLabel} · ${emitidoEm}` : emitidoEm,
    logoBase64,
  });

  y = desenharResumoCardsPdf(
    doc,
    [
      { label: "Total em dívidas", valor: formatCurrency(resumo.totalDividas) },
      { label: "Recebido", valor: formatCurrency(resumo.totalRecebido) },
      { label: "Saldo a receber", valor: formatCurrency(resumo.saldoAReceber), destaque: true },
    ],
    y
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(31, 41, 55);
  doc.text("Devedores", PDF_MARGIN_X, y + 10);

  const badgeCol = criarColunaBadgePdf(5, SITUACAO_TONE);

  autoTable(doc, {
    startY: y + 15,
    margin: { left: PDF_MARGIN_X, right: PDF_MARGIN_X },
    head: [
      [
        up("Cliente"),
        up("Data"),
        { content: up("Original"), styles: { halign: "right" } },
        { content: up("Pago"), styles: { halign: "right" } },
        { content: up("Saldo"), styles: { halign: "right" } },
        { content: up("Situação"), styles: { halign: "center" } },
      ],
    ],
    body: dividas.map((d) => [
      d.clienteNome,
      formatDate(d.dataServico),
      formatCurrency(d.valorOriginal),
      formatCurrency(d.totalPago),
      formatCurrency(d.saldo),
      SITUACAO_LABEL[d.situacao],
    ]),
    headStyles: TABLE_HEAD_STYLES,
    columnStyles: {
      1: { cellWidth: 25 },
      2: { cellWidth: 26, halign: "right" },
      3: { cellWidth: 26, halign: "right" },
      4: { cellWidth: 26, halign: "right" },
      5: { cellWidth: 24, halign: "center" },
    },
    styles: TABLE_BODY_STYLES,
    theme: "plain",
    didParseCell: badgeCol.didParseCell,
    didDrawCell: badgeCol.didDrawCell,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable.finalY + 8;
  desenharTotalPdf(doc, {
    label: "Saldo a receber",
    valor: formatCurrency(resumo.saldoAReceber),
    y: finalY,
  });
  desenharRodapePdf(doc, `${empresa.nome} · ${empresa.endereco} · CNPJ ${empresa.cnpj}`);

  return doc;
}
