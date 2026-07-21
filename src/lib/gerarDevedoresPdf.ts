import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { DadosEmpresa } from "./business";
import { formatCurrency, formatDate } from "./format";
import { carregarLogoComprimida } from "./pdfLogo";
import type { SituacaoDivida } from "./dividas";
import {
  desenharCabecalhoPdf,
  desenharResumoCardsPdf,
  desenharRodapePdf,
  PDF_MARGIN_X,
  TABLE_BODY_STYLES,
  TABLE_HEAD_STYLES,
} from "./pdfShell";

const SITUACAO_LABEL: Record<SituacaoDivida, string> = {
  em_aberto: "Em aberto",
  pagando: "Pagando",
  quitado: "Quitado",
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
    titulo: "Saldo em Aberto",
    subtitulo: periodoLabel ? `${periodoLabel} · Emitido em ${emitidoEm}` : `Emitido em ${emitidoEm}`,
    logoBase64,
  });

  y = desenharResumoCardsPdf(
    doc,
    [
      { label: "Total das dívidas", valor: formatCurrency(resumo.totalDividas) },
      { label: "Recebido", valor: formatCurrency(resumo.totalRecebido) },
      { label: "Saldo a receber", valor: formatCurrency(resumo.saldoAReceber), destaque: true },
    ],
    y
  );

  autoTable(doc, {
    startY: y + 10,
    margin: { left: PDF_MARGIN_X, right: PDF_MARGIN_X },
    head: [
      [
        "Cliente",
        "Data do serviço",
        { content: "Valor original", styles: { halign: "right" } },
        { content: "Pago", styles: { halign: "right" } },
        { content: "Saldo", styles: { halign: "right" } },
        "Situação",
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
      5: { cellWidth: 24 },
    },
    styles: TABLE_BODY_STYLES,
    theme: "plain",
  });

  desenharRodapePdf(doc, `${empresa.nome} · ${empresa.endereco} · CNPJ ${empresa.cnpj}`);

  return doc;
}
