import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { DadosEmpresa } from "./business";
import { formatCurrency, formatDate } from "./format";
import { carregarLogoComprimida } from "./pdfLogo";
import type { StatusExtra } from "./extras";

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
  doc.text("Relatório de Extras", marginX, 47);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  if (periodoLabel) {
    doc.text(periodoLabel, marginX, 53);
  }
  const emitidoEm = new Date().toLocaleDateString("pt-BR");
  doc.text(`Emitido em ${emitidoEm}`, pageWidth - marginX, 47, { align: "right" });

  const resumoLinhas: [string, number][] = [
    ["Total de extras", resumo.totalExtras],
    ["Já pago", resumo.totalPago],
    ["Falta pagar", resumo.faltaPagar],
    ["Lucro da empresa", resumo.lucroEmpresa],
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
    foot: [
      [
        "",
        "",
        "Total",
        { content: formatCurrency(resumo.totalExtras), styles: { halign: "right" } },
        { content: formatCurrency(resumo.faltaPagar), styles: { halign: "right" } },
        { content: formatCurrency(resumo.lucroEmpresa), styles: { halign: "right" } },
        "",
      ],
    ],
    headStyles: { fillColor: [17, 24, 39], textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [243, 244, 246], textColor: [17, 24, 39], fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 20 },
      3: { cellWidth: 22, halign: "right" },
      4: { cellWidth: 22, halign: "right" },
      5: { cellWidth: 22, halign: "right" },
      6: { cellWidth: 24 },
    },
    styles: { fontSize: 8.5, textColor: [55, 65, 81], cellPadding: 2.5 },
    theme: "striped",
  });

  return doc;
}
