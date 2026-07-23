import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { DadosEmpresa } from "./business";
import { formatCurrency, formatDate } from "./format";
import { carregarLogoComprimida } from "./pdfLogo";
import type { StatusExtra } from "./extras";
import {
  criarColunaBadgePdf,
  desenharCabecalhoPdf,
  desenharResumoTextoPdf,
  desenharRodapePdf,
  desenharTotalPdf,
  PDF_MARGIN_X,
  TABLE_BODY_STYLES,
  TABLE_HEAD_STYLES,
  up,
  type PdfBadgeTone,
} from "./pdfShell";

const STATUS_LABEL: Record<StatusExtra, string> = {
  pendente: "Pendente",
  parcialmente_pago: "Parcialmente pago",
  pago: "Pago",
};

const STATUS_TONE: Record<string, PdfBadgeTone> = {
  Pendente: "red",
  "Parcialmente pago": "amber",
  Pago: "green",
};

export interface ResumoExtras {
  totalExtras: number;
  totalPago: number;
  faltaPagar: number;
  lucroEmpresa: number;
}

export interface ExtraLinha {
  data: Date | string;
  mecanicoNome: string;
  clienteOuOs: string;
  descricao: string;
  valorExtra: number;
  saldo: number;
  lucroEmpresa: number;
  status: StatusExtra;
}

export interface GerarExtrasPdfParams {
  empresa: DadosEmpresa;
  periodoLabel: string;
  resumo: ResumoExtras;
  extras: ExtraLinha[];
  /** Mostra a coluna Funcionário na tabela. Padrão true — desligar quando o PDF for pra fora da oficina. */
  mostrarFuncionario?: boolean;
}

export async function gerarExtrasPdf({
  empresa,
  periodoLabel,
  resumo,
  extras,
  mostrarFuncionario = true,
}: GerarExtrasPdfParams): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const logoBase64 = await carregarLogoComprimida();
  const emitidoEm = new Date().toLocaleDateString("pt-BR");
  let y = desenharCabecalhoPdf(doc, {
    titulo: "Relatório de Extras",
    subtitulo: periodoLabel ? `${periodoLabel} · ${emitidoEm}` : emitidoEm,
    logoBase64,
  });

  y = desenharResumoTextoPdf(
    doc,
    [
      { label: "Total de extras", valor: formatCurrency(resumo.totalExtras) },
      { label: "Já pago", valor: formatCurrency(resumo.totalPago) },
      { label: "Falta pagar", valor: formatCurrency(resumo.faltaPagar) },
      { label: "Lucro da empresa", valor: formatCurrency(resumo.lucroEmpresa), destaque: true },
    ],
    y
  );

  const descricaoIdx = mostrarFuncionario ? 3 : 2;
  const extraIdx = descricaoIdx + 1;
  const saldoIdx = extraIdx + 1;
  const lucroIdx = saldoIdx + 1;
  const situacaoIdx = lucroIdx + 1;
  const badgeCol = criarColunaBadgePdf(situacaoIdx, STATUS_TONE);

  autoTable(doc, {
    startY: y + 6,
    margin: { left: PDF_MARGIN_X, right: PDF_MARGIN_X },
    head: [
      [
        up("Data"),
        ...(mostrarFuncionario ? [up("Funcionário")] : []),
        up("Cliente / OS"),
        up("Descrição"),
        { content: up("Extra"), styles: { halign: "right" } },
        { content: up("Saldo"), styles: { halign: "right" } },
        { content: up("Lucro"), styles: { halign: "right" } },
        { content: up("Situação"), styles: { halign: "center" } },
      ],
    ],
    body: extras.map((e) => [
      formatDate(e.data),
      ...(mostrarFuncionario ? [e.mecanicoNome] : []),
      e.clienteOuOs,
      e.descricao || "-",
      formatCurrency(e.valorExtra),
      formatCurrency(e.saldo),
      formatCurrency(e.lucroEmpresa),
      STATUS_LABEL[e.status],
    ]),
    headStyles: TABLE_HEAD_STYLES,
    columnStyles: {
      0: { cellWidth: 18 },
      [descricaoIdx]: { cellWidth: 32 },
      [extraIdx]: { cellWidth: 20, halign: "right" },
      [saldoIdx]: { cellWidth: 20, halign: "right" },
      [lucroIdx]: { cellWidth: 20, halign: "right" },
      [situacaoIdx]: { cellWidth: 24, halign: "center" },
    },
    styles: { ...TABLE_BODY_STYLES, fontSize: 8, cellPadding: 2.5 },
    theme: "plain",
    didParseCell: badgeCol.didParseCell,
    didDrawCell: badgeCol.didDrawCell,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable.finalY + 8;
  desenharTotalPdf(doc, { label: "Falta pagar", valor: formatCurrency(resumo.faltaPagar), y: finalY });
  desenharRodapePdf(doc, `${empresa.nome} · ${empresa.endereco} · CNPJ ${empresa.cnpj}`);

  return doc;
}
