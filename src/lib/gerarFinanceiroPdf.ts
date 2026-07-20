import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { DadosEmpresa } from "./business";
import { formatCurrency, formatDate } from "./format";
import { carregarLogoComprimida } from "./pdfLogo";

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
  doc.text("Relatório Financeiro", marginX, 47);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(periodoLabel, marginX, 53);
  const emitidoEm = new Date().toLocaleDateString("pt-BR");
  doc.text(`Emitido em ${emitidoEm}`, pageWidth - marginX, 47, { align: "right" });

  const resumoLinhas: [string, number][] = [
    ["Recebido no período", resumo.recebidoNoMes],
    ["A receber", resumo.aReceber],
    ["Despesas no período", resumo.despesasTotal],
    ["Funcionários no período", resumo.funcionariosNoMes],
    ["Lucro no período", resumo.lucroNoMes],
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
    foot: [
      [
        "",
        "",
        "",
        "Total",
        { content: formatCurrency(resumo.despesasTotal), styles: { halign: "right" } },
      ],
    ],
    headStyles: { fillColor: [17, 24, 39], textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [243, 244, 246], textColor: [17, 24, 39], fontStyle: "bold" },
    columnStyles: {
      3: { cellWidth: 25 },
      4: { cellWidth: 28, halign: "right" },
    },
    styles: { fontSize: 9, textColor: [55, 65, 81], cellPadding: 3 },
    theme: "striped",
  });

  return doc;
}
