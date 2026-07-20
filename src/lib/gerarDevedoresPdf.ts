import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { DadosEmpresa } from "./business";
import { formatCurrency, formatDate } from "./format";
import { carregarLogoComprimida } from "./pdfLogo";
import type { SituacaoDivida } from "./dividas";

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
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 15;

  const logoBase64 = await carregarLogoComprimida();
  if (logoBase64) {
    doc.addImage(logoBase64, "JPEG", marginX, 12, 22, 22);
  }

  const infoX = logoBase64 ? marginX + 28 : marginX;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(17, 24, 39);
  doc.text(empresa.nome, infoX, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(empresa.endereco, infoX, 24);
  doc.text(`Tel: ${empresa.telefone}  •  CNPJ: ${empresa.cnpj}`, infoX, 29);

  doc.setDrawColor(229, 231, 235);
  doc.line(marginX, 38, pageWidth - marginX, 38);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(17, 24, 39);
  doc.text("Relatório de Saldo em Aberto", marginX, 47);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(periodoLabel, marginX, 53);
  const emitidoEm = new Date().toLocaleDateString("pt-BR");
  doc.text(`Emitido em ${emitidoEm}`, pageWidth - marginX, 47, { align: "right" });

  const resumoLinhas: [string, number][] = [
    ["Total das dívidas", resumo.totalDividas],
    ["Total recebido", resumo.totalRecebido],
    ["Saldo a receber", resumo.saldoAReceber],
  ];

  let y = 63;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(17, 24, 39);
  doc.text("Resumo", marginX, y);
  y += 6;

  doc.setFontSize(9.5);
  for (const [label, valor] of resumoLinhas) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 65, 81);
    doc.text(label, marginX, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(17, 24, 39);
    doc.text(formatCurrency(valor), pageWidth - marginX, y, { align: "right" });
    y += 6;
  }

  autoTable(doc, {
    startY: y + 6,
    margin: { left: marginX, right: marginX },
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
    foot: [
      [
        "",
        "Total",
        { content: formatCurrency(resumo.totalDividas), styles: { halign: "right" } },
        { content: formatCurrency(resumo.totalRecebido), styles: { halign: "right" } },
        { content: formatCurrency(resumo.saldoAReceber), styles: { halign: "right" } },
        "",
      ],
    ],
    headStyles: { fillColor: [17, 24, 39], textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [243, 244, 246], textColor: [17, 24, 39], fontStyle: "bold" },
    columnStyles: {
      1: { cellWidth: 25 },
      2: { cellWidth: 26, halign: "right" },
      3: { cellWidth: 26, halign: "right" },
      4: { cellWidth: 26, halign: "right" },
      5: { cellWidth: 24 },
    },
    styles: { fontSize: 9, textColor: [55, 65, 81], cellPadding: 3 },
    theme: "striped",
  });

  return doc;
}
