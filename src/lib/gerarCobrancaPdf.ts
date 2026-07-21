import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import type { DadosEmpresa } from "./business";
import { formatCurrency, formatDate } from "./format";
import { gerarPayloadPix } from "./pixPayload";
import { carregarLogoComprimida } from "./pdfLogo";
import {
  desenharCabecalhoPdf,
  desenharRodapePdf,
  desenharTotalPdf,
  PDF_INK_900,
  PDF_MARGIN_X,
  TABLE_BODY_STYLES,
  TABLE_HEAD_STYLES,
} from "./pdfShell";

export interface CobrancaOS {
  id: number;
  data: Date | string;
  descricao: string;
  valor: number;
}

export interface CobrancaCliente {
  nome: string;
  telefone?: string | null;
  endereco?: string | null;
  cpfCnpj?: string | null;
}

export interface GerarCobrancaPdfParams {
  empresa: DadosEmpresa;
  cliente: CobrancaCliente;
  ordens: CobrancaOS[];
  pixKey?: string | null;
  dadosBancarios?: string | null;
  observacoes?: string | null;
}

export async function gerarCobrancaPdf({
  empresa,
  cliente,
  ordens,
  pixKey,
  dadosBancarios,
  observacoes,
}: GerarCobrancaPdfParams): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();

  const logoBase64 = await carregarLogoComprimida();
  // formatDate força UTC (correto pra datas sem hora vindas do banco); aqui é o instante atual,
  // então usa o fuso local do navegador de quem está gerando o PDF, senão a data vem adiantada.
  const emitidoEm = new Date().toLocaleDateString("pt-BR");
  let y = desenharCabecalhoPdf(doc, {
    titulo: "Cobrança de Serviços",
    subtitulo: `Emitido em ${emitidoEm}`,
    logoBase64,
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...PDF_INK_900);
  doc.text("Cliente", PDF_MARGIN_X, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(55, 65, 81);
  doc.text(cliente.nome, PDF_MARGIN_X, y);
  y += 5;
  if (cliente.telefone) {
    doc.text(cliente.telefone, PDF_MARGIN_X, y);
    y += 5;
  }
  if (cliente.endereco) {
    doc.text(cliente.endereco, PDF_MARGIN_X, y);
    y += 5;
  }
  if (cliente.cpfCnpj) {
    doc.text(cliente.cpfCnpj, PDF_MARGIN_X, y);
    y += 5;
  }

  const total = ordens.reduce((sum, os) => sum + os.valor, 0);

  autoTable(doc, {
    startY: y + 3,
    margin: { left: PDF_MARGIN_X, right: PDF_MARGIN_X },
    head: [["OS", "Data", "Descrição", { content: "Valor", styles: { halign: "right" } }]],
    body: ordens.map((os) => [
      `#${String(os.id).padStart(4, "0")}`,
      formatDate(os.data),
      os.descricao || "-",
      formatCurrency(os.valor),
    ]),
    headStyles: TABLE_HEAD_STYLES,
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 25 },
      3: { cellWidth: 30, halign: "right" },
    },
    styles: { ...TABLE_BODY_STYLES, fontSize: 9.5 },
    theme: "plain",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let afterTableY = (doc as any).lastAutoTable.finalY + 8;
  afterTableY = desenharTotalPdf(doc, {
    label: "Total em aberto",
    valor: formatCurrency(total),
    y: afterTableY,
  });
  afterTableY += 10;

  if (pixKey) {
    let qrDataUrl: string | null = null;
    try {
      const payload = gerarPayloadPix({
        chave: pixKey,
        nomeRecebedor: empresa.nome,
        cidade: empresa.cidade,
        valor: total,
      });
      qrDataUrl = await QRCode.toDataURL(payload, { margin: 1, width: 300 });
    } catch {
      qrDataUrl = null;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...PDF_INK_900);
    doc.text("Pagamento via Pix", PDF_MARGIN_X, afterTableY);

    if (qrDataUrl) {
      const qrSize = 30;
      const qrY = afterTableY + 3;
      doc.addImage(qrDataUrl, "PNG", PDF_MARGIN_X, qrY, qrSize, qrSize);

      const textX = PDF_MARGIN_X + qrSize + 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(55, 65, 81);
      doc.text("Escaneie o QR Code no app do seu banco", textX, qrY + 6);
      doc.text(`Chave Pix: ${pixKey}`, textX, qrY + 13);
      doc.text(`Valor: ${formatCurrency(total)}`, textX, qrY + 20);

      afterTableY = qrY + qrSize + 8;
    } else {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(55, 65, 81);
      doc.text(`Chave Pix: ${pixKey}`, PDF_MARGIN_X, afterTableY + 5);
      afterTableY += 13;
    }
  }

  if (dadosBancarios) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...PDF_INK_900);
    doc.text("Dados bancários", PDF_MARGIN_X, afterTableY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 65, 81);
    const linhasBanco = doc.splitTextToSize(dadosBancarios, pageWidth - PDF_MARGIN_X * 2);
    doc.text(linhasBanco, PDF_MARGIN_X, afterTableY + 5);
    afterTableY += 5 + linhasBanco.length * 4.5 + 5;
  }

  if (observacoes) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...PDF_INK_900);
    doc.text("Observações", PDF_MARGIN_X, afterTableY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 65, 81);
    const linhas = doc.splitTextToSize(observacoes, pageWidth - PDF_MARGIN_X * 2);
    doc.text(linhas, PDF_MARGIN_X, afterTableY + 5);
  }

  desenharRodapePdf(doc, `${empresa.nome} · ${empresa.endereco} · CNPJ ${empresa.cnpj}`);

  return doc;
}
