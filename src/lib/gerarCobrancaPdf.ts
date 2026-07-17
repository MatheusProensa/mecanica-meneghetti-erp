import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import type { DadosEmpresa } from "./business";
import { formatCurrency, formatDate } from "./format";
import { gerarPayloadPix } from "./pixPayload";
import { carregarLogoComprimida } from "./pdfLogo";

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
  doc.text("Cobrança de Serviços", marginX, 47);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  // formatDate força UTC (correto pra datas sem hora vindas do banco); aqui é o instante atual,
  // então usa o fuso local do navegador de quem está gerando o PDF, senão a data vem adiantada.
  const emitidoEm = new Date().toLocaleDateString("pt-BR");
  doc.text(`Emitido em ${emitidoEm}`, pageWidth - marginX, 47, { align: "right" });

  let y = 56;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(17, 24, 39);
  doc.text("Cliente", marginX, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(55, 65, 81);
  doc.text(cliente.nome, marginX, y);
  y += 5;
  if (cliente.telefone) {
    doc.text(cliente.telefone, marginX, y);
    y += 5;
  }
  if (cliente.endereco) {
    doc.text(cliente.endereco, marginX, y);
    y += 5;
  }
  if (cliente.cpfCnpj) {
    doc.text(cliente.cpfCnpj, marginX, y);
    y += 5;
  }

  const total = ordens.reduce((sum, os) => sum + os.valor, 0);

  autoTable(doc, {
    startY: y + 3,
    margin: { left: marginX, right: marginX },
    head: [["OS", "Data", "Descrição", { content: "Valor", styles: { halign: "right" } }]],
    body: ordens.map((os) => [
      `#${String(os.id).padStart(4, "0")}`,
      formatDate(os.data),
      os.descricao || "-",
      formatCurrency(os.valor),
    ]),
    foot: [
      [
        "",
        "",
        "Total em aberto",
        { content: formatCurrency(total), styles: { halign: "right" } },
      ],
    ],
    headStyles: { fillColor: [17, 24, 39], textColor: 255, fontStyle: "bold" },
    footStyles: { fillColor: [243, 244, 246], textColor: [17, 24, 39], fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 25 },
      3: { cellWidth: 30, halign: "right" },
    },
    styles: { fontSize: 9.5, textColor: [55, 65, 81], cellPadding: 3 },
    theme: "striped",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let afterTableY = (doc as any).lastAutoTable.finalY + 10;

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
    doc.setTextColor(17, 24, 39);
    doc.text("Pagamento via Pix", marginX, afterTableY);

    if (qrDataUrl) {
      const qrSize = 30;
      const qrY = afterTableY + 3;
      doc.addImage(qrDataUrl, "PNG", marginX, qrY, qrSize, qrSize);

      const textX = marginX + qrSize + 6;
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
      doc.text(`Chave Pix: ${pixKey}`, marginX, afterTableY + 5);
      afterTableY += 13;
    }
  }

  if (dadosBancarios) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(17, 24, 39);
    doc.text("Dados bancários", marginX, afterTableY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 65, 81);
    const linhasBanco = doc.splitTextToSize(dadosBancarios, pageWidth - marginX * 2);
    doc.text(linhasBanco, marginX, afterTableY + 5);
    afterTableY += 5 + linhasBanco.length * 4.5 + 5;
  }

  if (observacoes) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(17, 24, 39);
    doc.text("Observações", marginX, afterTableY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 65, 81);
    const linhas = doc.splitTextToSize(observacoes, pageWidth - marginX * 2);
    doc.text(linhas, marginX, afterTableY + 5);
  }

  return doc;
}
