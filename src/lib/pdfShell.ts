import { jsPDF } from "jspdf";

/** Paleta compartilhada dos PDFs, seguindo os tokens de marca do sistema. */
export const PDF_NAVY: [number, number, number] = [15, 17, 23];
export const PDF_BRAND: [number, number, number] = [37, 99, 235];
export const PDF_INK_900: [number, number, number] = [31, 41, 55];
export const PDF_INK_500: [number, number, number] = [100, 116, 139];
export const PDF_INK_300: [number, number, number] = [156, 163, 175];

export const PDF_MARGIN_X = 15;

const HEADER_HEIGHT = 34;

/** Header navy de largura total, com logo à esquerda e título/subtítulo à direita. Retorna o Y onde o conteúdo deve começar. */
export function desenharCabecalhoPdf(
  doc: jsPDF,
  { titulo, subtitulo, logoBase64 }: { titulo: string; subtitulo?: string; logoBase64: string | null }
): number {
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFillColor(...PDF_NAVY);
  doc.rect(0, 0, pageWidth, HEADER_HEIGHT, "F");

  if (logoBase64) {
    const logoH = 20;
    doc.addImage(logoBase64, "JPEG", PDF_MARGIN_X, (HEADER_HEIGHT - logoH) / 2, logoH, logoH);
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...PDF_BRAND);
  doc.text(titulo, pageWidth - PDF_MARGIN_X, subtitulo ? HEADER_HEIGHT / 2 - 1 : HEADER_HEIGHT / 2 + 2, {
    align: "right",
  });

  if (subtitulo) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...PDF_INK_300);
    doc.text(subtitulo, pageWidth - PDF_MARGIN_X, HEADER_HEIGHT / 2 + 5, { align: "right" });
  }

  return HEADER_HEIGHT + 14;
}

/** Caixa navy de destaque pro total, alinhada à direita. Retorna o Y logo abaixo da caixa. */
export function desenharTotalPdf(
  doc: jsPDF,
  { label, valor, y }: { label: string; valor: string; y: number }
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const boxWidth = 74;
  const boxHeight = 14;
  const boxX = pageWidth - PDF_MARGIN_X - boxWidth;

  doc.setFillColor(...PDF_NAVY);
  doc.roundedRect(boxX, y, boxWidth, boxHeight, 2, 2, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...PDF_INK_300);
  doc.text(label, boxX + 6, y + boxHeight / 2 + 1.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(valor, boxX + boxWidth - 6, y + boxHeight / 2 + 2, { align: "right" });

  return y + boxHeight;
}

/** Rodapé centralizado no fim da página, com os dados da oficina. */
export function desenharRodapePdf(doc: jsPDF, texto: string): void {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setDrawColor(229, 231, 235);
  doc.line(PDF_MARGIN_X, pageHeight - 16, pageWidth - PDF_MARGIN_X, pageHeight - 16);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...PDF_INK_300);
  doc.text(texto, pageWidth / 2, pageHeight - 10, { align: "center" });
}

export interface ResumoCardPdf {
  label: string;
  valor: string;
  destaque?: boolean;
}

/** Linha de cartões de resumo (KPIs), com o último podendo vir destacado em azul. Retorna o Y abaixo dos cartões. */
export function desenharResumoCardsPdf(doc: jsPDF, cards: ResumoCardPdf[], y: number): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const usableWidth = pageWidth - PDF_MARGIN_X * 2;
  const gap = 4;
  const cardWidth = (usableWidth - gap * (cards.length - 1)) / cards.length;
  const cardHeight = 20;

  cards.forEach((card, i) => {
    const x = PDF_MARGIN_X + i * (cardWidth + gap);

    if (card.destaque) {
      doc.setFillColor(...PDF_BRAND);
      doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, "F");
      doc.setTextColor(219, 234, 254);
    } else {
      doc.setDrawColor(229, 231, 235);
      doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, "S");
      doc.setTextColor(...PDF_INK_300);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(card.label.toUpperCase(), x + 5, y + 7);

    if (card.destaque) {
      doc.setTextColor(255, 255, 255);
    } else {
      doc.setTextColor(...PDF_INK_900);
    }
    doc.setFontSize(12.5);
    doc.text(card.valor, x + 5, y + 15);
  });

  return y + cardHeight;
}

/** Estilo do cabeçalho da tabela: sem preenchimento, borda inferior grossa (igual ao handoff). */
export const TABLE_HEAD_STYLES = {
  fillColor: [255, 255, 255] as [number, number, number],
  textColor: PDF_INK_300,
  fontStyle: "bold" as const,
  fontSize: 8,
  lineColor: PDF_INK_900 as [number, number, number],
  lineWidth: 0.3,
};

/** Estilo do corpo da tabela: sem zebra, linhas horizontais bem claras. */
export const TABLE_BODY_STYLES = {
  fontSize: 9,
  textColor: PDF_INK_900 as [number, number, number],
  cellPadding: 3,
  lineColor: [243, 244, 246] as [number, number, number],
  lineWidth: 0.15,
};
