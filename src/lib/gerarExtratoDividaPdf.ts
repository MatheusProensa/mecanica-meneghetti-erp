import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { DadosEmpresa } from "./business";
import { formatCpfCnpj, formatCurrency, formatDate } from "./format";
import { carregarLogoComprimida } from "./pdfLogo";
import {
  desenharCabecalhoPdf,
  desenharResumoTextoPdf,
  desenharRodapePdf,
  PDF_INK_900,
  PDF_MARGIN_X,
  TABLE_BODY_STYLES,
  TABLE_HEAD_STYLES,
  up,
} from "./pdfShell";

export interface ExtratoDividaItem {
  data: Date | string;
  descricao: string;
  valor: number;
}

export interface ExtratoDividaPagamento {
  data: Date | string;
  valor: number;
  formaPagamento?: string | null;
  observacao?: string | null;
}

export interface GerarExtratoDividaPdfParams {
  empresa: DadosEmpresa;
  cliente: { nome: string; telefone?: string | null; endereco?: string | null; cpfCnpj?: string | null };
  situacaoLabel: string;
  itens: ExtratoDividaItem[];
  pagamentos: ExtratoDividaPagamento[];
}

/** Extrato individual de uma dívida — nome do devedor, os serviços que compõem
 * a dívida e o histórico completo de pagamentos já recebidos, item a item. */
export async function gerarExtratoDividaPdf({
  empresa,
  cliente,
  situacaoLabel,
  itens,
  pagamentos,
}: GerarExtratoDividaPdfParams): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const colDireitaX = pageWidth / 2 + 5;

  const logoBase64 = await carregarLogoComprimida();
  const emitidoEm = new Date().toLocaleDateString("pt-BR");
  const yInicio = desenharCabecalhoPdf(doc, {
    titulo: "Extrato de Dívida",
    subtitulo: `Emitido em ${emitidoEm}`,
    logoBase64,
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(up("Devedor"), PDF_MARGIN_X, yInicio);
  doc.text(up("Emitido por"), colDireitaX, yInicio);

  let yEsq = yInicio + 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...PDF_INK_900);
  doc.text(cliente.nome, PDF_MARGIN_X, yEsq);

  let yDir = yInicio + 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...PDF_INK_900);
  doc.text(empresa.nome || "-", colDireitaX, yDir);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  if (cliente.telefone) {
    yEsq += 5;
    doc.text(`Tel: ${cliente.telefone}`, PDF_MARGIN_X, yEsq);
  }
  if (cliente.endereco) {
    yEsq += 5;
    doc.text(`Endereço: ${cliente.endereco}`, PDF_MARGIN_X, yEsq);
  }
  if (cliente.cpfCnpj) {
    yEsq += 5;
    doc.text(`CNPJ: ${formatCpfCnpj(cliente.cpfCnpj)}`, PDF_MARGIN_X, yEsq);
  }

  if (empresa.telefone) {
    yDir += 5;
    doc.text(`Tel: ${empresa.telefone}`, colDireitaX, yDir);
  }
  if (empresa.endereco) {
    yDir += 5;
    doc.text(`Endereço: ${empresa.endereco}`, colDireitaX, yDir);
  }
  if (empresa.cnpj) {
    yDir += 5;
    doc.text(`CNPJ: ${formatCpfCnpj(empresa.cnpj)}`, colDireitaX, yDir);
  }

  let y = Math.max(yEsq, yDir) + 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(up(`Situação: ${situacaoLabel}`), PDF_MARGIN_X, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(31, 41, 55);
  doc.text("Serviços que compõem a dívida", PDF_MARGIN_X, y);

  autoTable(doc, {
    startY: y + 4,
    margin: { left: PDF_MARGIN_X, right: PDF_MARGIN_X },
    head: [[up("Data"), up("Descrição"), { content: up("Valor"), styles: { halign: "right" } }]],
    body: itens.map((item) => [formatDate(item.data), item.descricao || "-", formatCurrency(item.valor)]),
    headStyles: TABLE_HEAD_STYLES,
    columnStyles: {
      0: { cellWidth: 25 },
      2: { cellWidth: 30, halign: "right" },
    },
    styles: { ...TABLE_BODY_STYLES, fontSize: 9.5 },
    theme: "plain",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let afterY = (doc as any).lastAutoTable.finalY + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(31, 41, 55);
  doc.text("Pagamentos já recebidos", PDF_MARGIN_X, afterY);

  if (pagamentos.length > 0) {
    autoTable(doc, {
      startY: afterY + 4,
      margin: { left: PDF_MARGIN_X, right: PDF_MARGIN_X },
      head: [
        [
          up("Data"),
          up("Forma"),
          up("Observação"),
          { content: up("Valor"), styles: { halign: "right" } },
        ],
      ],
      body: pagamentos.map((p) => [
        formatDate(p.data),
        p.formaPagamento || "-",
        p.observacao || "-",
        formatCurrency(p.valor),
      ]),
      headStyles: TABLE_HEAD_STYLES,
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 32 },
        3: { cellWidth: 30, halign: "right" },
      },
      styles: { ...TABLE_BODY_STYLES, fontSize: 9.5 },
      theme: "plain",
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    afterY = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(107, 114, 128);
    doc.text("Nenhum pagamento registrado ainda.", PDF_MARGIN_X, afterY + 6);
    afterY += 16;
  }

  const valorOriginal = itens.reduce((s, i) => s + i.valor, 0);
  const totalPago = pagamentos.reduce((s, p) => s + p.valor, 0);
  const saldo = Math.max(0, valorOriginal - totalPago);

  desenharResumoTextoPdf(
    doc,
    [
      { label: "Valor original", valor: formatCurrency(valorOriginal) },
      { label: "Total já pago", valor: formatCurrency(totalPago) },
      { label: "Saldo restante", valor: formatCurrency(saldo), destaque: true },
    ],
    afterY
  );

  desenharRodapePdf(doc, `${empresa.nome} · ${empresa.endereco} · CNPJ: ${formatCpfCnpj(empresa.cnpj)}`);

  return doc;
}
