import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { DadosEmpresa } from "./business";
import { formatCurrency, formatDate } from "./format";
import { carregarLogoComprimida } from "./pdfLogo";
import type { StatusExtra } from "./extras";
import {
  desenharCabecalhoPdf,
  desenharResumoCardsPdf,
  desenharRodapePdf,
  PDF_MARGIN_X,
  TABLE_BODY_STYLES,
  TABLE_HEAD_STYLES,
} from "./pdfShell";

const STATUS_LABEL: Record<StatusExtra, string> = {
  pendente: "Pendente",
  parcialmente_pago: "Parcialmente pago",
  pago: "Pago",
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
}

export async function gerarExtrasPdf({
  empresa,
  periodoLabel,
  resumo,
  extras,
}: GerarExtrasPdfParams): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const logoBase64 = await carregarLogoComprimida();
  const emitidoEm = new Date().toLocaleDateString("pt-BR");
  let y = desenharCabecalhoPdf(doc, {
    titulo: "Relatório de Extras",
    subtitulo: periodoLabel ? `${periodoLabel} · Emitido em ${emitidoEm}` : `Emitido em ${emitidoEm}`,
    logoBase64,
  });

  y = desenharResumoCardsPdf(
    doc,
    [
      { label: "Total de extras", valor: formatCurrency(resumo.totalExtras) },
      { label: "Já pago", valor: formatCurrency(resumo.totalPago) },
      { label: "Falta pagar", valor: formatCurrency(resumo.faltaPagar) },
      { label: "Lucro da empresa", valor: formatCurrency(resumo.lucroEmpresa), destaque: true },
    ],
    y
  );

  autoTable(doc, {
    startY: y + 10,
    margin: { left: PDF_MARGIN_X, right: PDF_MARGIN_X },
    head: [
      [
        "Data",
        "Funcionário",
        "Cliente / OS",
        { content: "Extra", styles: { halign: "right" } },
        { content: "Saldo", styles: { halign: "right" } },
        { content: "Lucro", styles: { halign: "right" } },
        "Situação",
      ],
    ],
    body: extras.map((e) => [
      formatDate(e.data),
      e.mecanicoNome,
      e.clienteOuOs,
      formatCurrency(e.valorExtra),
      formatCurrency(e.saldo),
      formatCurrency(e.lucroEmpresa),
      STATUS_LABEL[e.status],
    ]),
    headStyles: TABLE_HEAD_STYLES,
    columnStyles: {
      0: { cellWidth: 20 },
      3: { cellWidth: 22, halign: "right" },
      4: { cellWidth: 22, halign: "right" },
      5: { cellWidth: 22, halign: "right" },
      6: { cellWidth: 24 },
    },
    styles: { ...TABLE_BODY_STYLES, fontSize: 8.5, cellPadding: 2.5 },
    theme: "plain",
  });

  desenharRodapePdf(doc, `${empresa.nome} · ${empresa.endereco} · CNPJ ${empresa.cnpj}`);

  return doc;
}
