import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { DadosEmpresa } from "./business";
import { formatCurrency, formatDate } from "./format";
import { carregarLogoComprimida } from "./pdfLogo";

export interface OSLinha {
  id: number;
  clienteNome: string;
  data: Date | string;
  statusLabel: string;
  pagamentoLabel: string;
  valor: number;
}

export interface ResumoOS {
  quantidade: number;
  valorTotal: number;
  recebido: number;
  aReceber: number;
}

export interface GerarOSPdfParams {
  empresa: DadosEmpresa;
  periodoLabel: string;
  resumo: ResumoOS;
  ordens: OSLinha[];
}

export async function gerarOSPdf({
  empresa,
  periodoLabel,
  resumo,
  ordens,
}: GerarOSPdfParams): Promise<jsPDF> {
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
  doc.text("Ordens de Serviço", marginX, 47);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(periodoLabel, marginX, 53);
  const emitidoEm = new Date().toLocaleDateString("pt-BR");
  doc.text(`Emitido em ${emitidoEm}`, pageWidth - marginX, 47, { align: "right" });

  const resumoLinhas: [string, string][] = [
    ["Quantidade de OS", String(resumo.quantidade)],
    ["Valor total", formatCurrency(resumo.valorTotal)],
    ["Recebido", formatCurrency(resumo.recebido)],
    ["A receber", formatCurrency(resumo.aReceber)],
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
    doc.text(valor, pageWidth - marginX, y, { align: "right" });
    y += 6;
  }

  autoTable(doc, {
    startY: y + 6,
    margin: { left: marginX, right: marginX },
    head: [
      [
        "OS",
        "Cliente",
        "Data",
        "Status",
        "Pagamento",
        { content: "Valor", styles: { halign: "right" } },
      ],
    ],
    body: ordens.map((os) => [
      `#${String(os.id).padStart(4, "0")}`,
      os.clienteNome,
      formatDate(os.data),
      os.statusLabel,
      os.pagamentoLabel,
      formatCurrency(os.valor),
    ]),
    foot: [
      [
        "",
        "",
        "",
        "",
        "Total",
        { content: formatCurrency(resumo.valorTotal), styles: { halign: "right" } },
      ],
    ],
    headStyles: { fillColor: [17, 24, 39], textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [243, 244, 246], textColor: [17, 24, 39], fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 18 },
      2: { cellWidth: 22 },
      5: { cellWidth: 26, halign: "right" },
    },
    styles: { fontSize: 9, textColor: [55, 65, 81], cellPadding: 3 },
    theme: "striped",
  });

  return doc;
}
