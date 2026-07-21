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
  PDF_BRAND,
  PDF_INK_900,
  PDF_MARGIN_X,
  TABLE_BODY_STYLES,
  TABLE_HEAD_STYLES,
  up,
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
  const colDireitaX = pageWidth / 2 + 5;

  const logoBase64 = await carregarLogoComprimida();
  // formatDate força UTC (correto pra datas sem hora vindas do banco); aqui é o instante atual,
  // então usa o fuso local do navegador de quem está gerando o PDF, senão a data vem adiantada.
  const emitidoEm = new Date().toLocaleDateString("pt-BR");
  const yInicio = desenharCabecalhoPdf(doc, {
    titulo: "Cobrança de Serviços",
    subtitulo: emitidoEm,
    logoBase64,
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(156, 163, 175);
  doc.text(up("Cobrado de"), PDF_MARGIN_X, yInicio);
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
  doc.text(empresa.nome, colDireitaX, yDir);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
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

  const y = Math.max(yEsq, yDir) + 8;

  const total = ordens.reduce((sum, os) => sum + os.valor, 0);

  autoTable(doc, {
    startY: y,
    margin: { left: PDF_MARGIN_X, right: PDF_MARGIN_X },
    head: [[up("OS"), up("Data"), up("Descrição"), { content: up("Valor"), styles: { halign: "right" } }]],
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
    cor: PDF_BRAND,
  });
  afterTableY += 12;

  if (pixKey) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(up("Pagamento via Pix"), PDF_MARGIN_X, afterTableY);

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

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(55, 65, 81);
    doc.text(`Chave: ${pixKey}`, PDF_MARGIN_X, afterTableY + 7);

    doc.setFontSize(8.5);
    doc.setTextColor(...PDF_BRAND);
    doc.text("Obrigado pela preferência — " + empresa.nome, PDF_MARGIN_X, afterTableY + 13);

    if (qrDataUrl) {
      const qrSize = 26;
      const qrX = pageWidth - PDF_MARGIN_X - qrSize - 9;
      doc.setDrawColor(229, 231, 235);
      doc.roundedRect(qrX - 3, afterTableY - 4, qrSize + 6, qrSize + 6, 2, 2, "S");
      doc.addImage(qrDataUrl, "PNG", qrX, afterTableY - 1, qrSize, qrSize);
      afterTableY += qrSize + 6;
    } else {
      afterTableY += 16;
    }
  }

  if (dadosBancarios) {
    afterTableY += 6;
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
    afterTableY += 6;
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
