import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { DadosEmpresa } from "./business";
import { formatCurrency, formatDate } from "./format";
import { carregarLogoComprimida } from "./pdfLogo";
import {
  desenharCabecalhoPdf,
  desenharRodapePdf,
  desenharTotalPdf,
  PDF_BRAND,
  PDF_INK_300,
  PDF_INK_900,
  PDF_MARGIN_X,
  TABLE_BODY_STYLES,
  TABLE_HEAD_STYLES,
  up,
} from "./pdfShell";

export interface OrdemServicoItemPdf {
  data: Date | string;
  descricao: string;
  valor: number;
}

export interface GerarOrdemServicoPdfParams {
  empresa: DadosEmpresa;
  os: {
    id: number;
    data: Date | string;
    statusLabel: string;
    mecanicoNome?: string | null;
    previsaoEntrega?: Date | string | null;
    formaPagamento?: string | null;
    observacoes?: string | null;
  };
  cliente: {
    nome: string;
    telefone?: string | null;
    endereco?: string | null;
    cpfCnpj?: string | null;
  };
  itens: OrdemServicoItemPdf[];
}

/** Documento individual da OS — pra imprimir/entregar ao cliente, no padrão de uma
 * ordem de serviço tradicional (dados do cliente, itens, total e assinatura). */
export async function gerarOrdemServicoPdf({
  empresa,
  os,
  cliente,
  itens,
}: GerarOrdemServicoPdfParams): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const colDireitaX = pageWidth / 2 + 5;

  const logoBase64 = await carregarLogoComprimida();
  const numeroOS = `#${String(os.id).padStart(4, "0")}`;

  const yInicio = desenharCabecalhoPdf(doc, {
    titulo: "Ordem de Serviço",
    subtitulo: `${numeroOS} · ${formatDate(os.data)}`,
    logoBase64,
  });

  // Bloco Cliente / Oficina, lado a lado
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...PDF_INK_300);
  doc.text(up("Cliente"), PDF_MARGIN_X, yInicio);
  doc.text(up("Oficina"), colDireitaX, yInicio);

  let yEsq = yInicio + 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...PDF_INK_900);
  doc.text(cliente.nome, PDF_MARGIN_X, yEsq);

  let yDir = yInicio + 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...PDF_INK_900);
  doc.text(empresa.nome, colDireitaX, yDir);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  if (cliente.telefone) {
    yEsq += 5;
    doc.text(cliente.telefone, PDF_MARGIN_X, yEsq);
  }
  if (cliente.endereco) {
    yEsq += 5;
    doc.text(cliente.endereco, PDF_MARGIN_X, yEsq);
  }
  if (cliente.cpfCnpj) {
    yEsq += 5;
    doc.text(cliente.cpfCnpj, PDF_MARGIN_X, yEsq);
  }

  yDir += 5;
  doc.text(empresa.endereco, colDireitaX, yDir);
  yDir += 5;
  doc.text(`CNPJ ${empresa.cnpj}`, colDireitaX, yDir);

  let y = Math.max(yEsq, yDir) + 10;

  // Faixa de dados da ordem: Status / Mecânico / Previsão / Pagamento
  const campos = [
    { label: "Status", valor: os.statusLabel },
    { label: "Mecânico", valor: os.mecanicoNome || "-" },
    { label: "Previsão de entrega", valor: os.previsaoEntrega ? formatDate(os.previsaoEntrega) : "-" },
    { label: "Forma de pagamento", valor: os.formaPagamento || "-" },
  ];
  const usableWidth = pageWidth - PDF_MARGIN_X * 2;
  const colWidth = usableWidth / campos.length;
  doc.setDrawColor(229, 231, 235);
  doc.line(PDF_MARGIN_X, y, pageWidth - PDF_MARGIN_X, y);
  y += 6;
  campos.forEach((campo, i) => {
    const x = PDF_MARGIN_X + i * colWidth;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...PDF_INK_300);
    doc.text(up(campo.label), x, y);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...PDF_INK_900);
    doc.text(campo.valor, x, y + 5.5);
  });
  y += 12;
  doc.line(PDF_MARGIN_X, y, pageWidth - PDF_MARGIN_X, y);
  y += 8;

  const total = itens.reduce((sum, i) => sum + i.valor, 0);

  autoTable(doc, {
    startY: y,
    margin: { left: PDF_MARGIN_X, right: PDF_MARGIN_X },
    head: [[up("Data"), up("Descrição do serviço"), { content: up("Valor"), styles: { halign: "right" } }]],
    body: itens.map((item) => [formatDate(item.data), item.descricao || "-", formatCurrency(item.valor)]),
    headStyles: TABLE_HEAD_STYLES,
    columnStyles: {
      0: { cellWidth: 24 },
      2: { cellWidth: 30, halign: "right" },
    },
    styles: { ...TABLE_BODY_STYLES, fontSize: 9.5 },
    theme: "plain",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let afterTableY = (doc as any).lastAutoTable.finalY + 8;
  afterTableY = desenharTotalPdf(doc, {
    label: "Total do serviço",
    valor: formatCurrency(total),
    y: afterTableY,
    cor: PDF_BRAND,
  });

  if (os.observacoes) {
    afterTableY += 12;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...PDF_INK_900);
    doc.text("Observações", PDF_MARGIN_X, afterTableY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81);
    const linhas = doc.splitTextToSize(os.observacoes, pageWidth - PDF_MARGIN_X * 2);
    doc.text(linhas, PDF_MARGIN_X, afterTableY + 5);
  }

  // Assinaturas, sempre no mesmo lugar perto do rodapé
  const yAssinatura = pageHeight - 32;
  const larguraAssinatura = (usableWidth - 20) / 2;
  doc.setDrawColor(156, 163, 175);
  doc.line(PDF_MARGIN_X, yAssinatura, PDF_MARGIN_X + larguraAssinatura, yAssinatura);
  doc.line(
    pageWidth - PDF_MARGIN_X - larguraAssinatura,
    yAssinatura,
    pageWidth - PDF_MARGIN_X,
    yAssinatura
  );
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...PDF_INK_300);
  doc.text("Assinatura do cliente", PDF_MARGIN_X, yAssinatura + 5);
  doc.text(`Assinatura — ${empresa.nome}`, pageWidth - PDF_MARGIN_X - larguraAssinatura, yAssinatura + 5);

  desenharRodapePdf(doc, `${empresa.nome} · ${empresa.endereco} · CNPJ ${empresa.cnpj}`);

  return doc;
}
