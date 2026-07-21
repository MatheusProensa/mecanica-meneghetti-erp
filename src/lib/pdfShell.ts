import { jsPDF } from "jspdf";

/** Paleta compartilhada dos PDFs, seguindo os tokens de marca do sistema. */
export const PDF_NAVY: [number, number, number] = [15, 17, 23];
export const PDF_BRAND: [number, number, number] = [37, 99, 235];
export const PDF_INK_900: [number, number, number] = [31, 41, 55];
export const PDF_INK_500: [number, number, number] = [100, 116, 139];
export const PDF_INK_300: [number, number, number] = [156, 163, 175];
const PDF_GRAY_BG: [number, number, number] = [243, 244, 246];

export const PDF_MARGIN_X = 15;

const HEADER_HEIGHT = 34;
const CARD_MARGIN = 9;
const CARD_TOP_GAP = 6;

/** Uppercase pros cabeçalhos de tabela (o handoff usa text-transform:uppercase, que o PDF não aplica sozinho). */
export function up(s: string): string {
  return s.toUpperCase();
}

/**
 * Header navy de largura total (logo + título/subtítulo em azul da marca), seguido do fundo
 * cinza claro com o cartão branco arredondado onde o conteúdo é desenhado. Retorna o Y onde
 * o conteúdo deve começar, já dentro do cartão.
 */
export function desenharCabecalhoPdf(
  doc: jsPDF,
  { titulo, subtitulo, logoBase64 }: { titulo: string; subtitulo?: string; logoBase64: string | null }
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

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

  doc.setFillColor(...PDF_GRAY_BG);
  doc.rect(0, HEADER_HEIGHT, pageWidth, pageHeight - HEADER_HEIGHT, "F");

  const cardTop = HEADER_HEIGHT + CARD_TOP_GAP;
  const cardHeight = pageHeight - CARD_MARGIN - cardTop;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(CARD_MARGIN, cardTop, pageWidth - CARD_MARGIN * 2, cardHeight, 4, 4, "F");

  return cardTop + 14;
}

/** Caixa de destaque pro total, alinhada à direita. Retorna o Y logo abaixo da caixa. */
export function desenharTotalPdf(
  doc: jsPDF,
  {
    label,
    valor,
    y,
    cor = PDF_NAVY,
  }: { label: string; valor: string; y: number; cor?: [number, number, number] }
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  const boxWidth = 74;
  const boxHeight = 14;
  const boxX = pageWidth - PDF_MARGIN_X - boxWidth;

  doc.setFillColor(...cor);
  doc.roundedRect(boxX, y, boxWidth, boxHeight, 2, 2, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(219, 234, 254);
  doc.text(label, boxX + 6, y + boxHeight / 2 + 1.5);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.text(valor, boxX + boxWidth - 6, y + boxHeight / 2 + 2, { align: "right" });

  return y + boxHeight;
}

/** Rodapé centralizado no fim da página (dentro do cartão), com os dados da oficina. */
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
    doc.text(up(card.label), x + 5, y + 7);

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

/** Resumo em texto (label ... valor, alinhado à direita) — usado no Extras, seguindo o handoff. */
export function desenharResumoTextoPdf(
  doc: jsPDF,
  linhas: { label: string; valor: string; destaque?: boolean }[],
  y: number
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  let cursor = y;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...PDF_INK_900);
  doc.text("Resumo", PDF_MARGIN_X, cursor);
  cursor += 7;

  for (const linha of linhas) {
    doc.setFont("helvetica", linha.destaque ? "bold" : "normal");
    doc.setFontSize(linha.destaque ? 10.5 : 9.5);
    if (linha.destaque) {
      doc.setTextColor(...PDF_INK_900);
    } else {
      doc.setTextColor(55, 65, 81);
    }
    doc.text(linha.label, PDF_MARGIN_X, cursor);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...PDF_INK_900);
    doc.text(linha.valor, pageWidth - PDF_MARGIN_X, cursor, { align: "right" });
    cursor += linha.destaque ? 7.5 : 6;
  }

  return cursor;
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
  lineColor: PDF_GRAY_BG,
  lineWidth: 0.15,
};

export type PdfBadgeTone = "green" | "amber" | "red" | "blue" | "gray";

const BADGE_COLORS: Record<PdfBadgeTone, { bg: [number, number, number]; texto: [number, number, number] }> = {
  green: { bg: [220, 252, 231], texto: [21, 128, 61] },
  amber: { bg: [254, 243, 199], texto: [146, 64, 14] },
  red: { bg: [254, 226, 226], texto: [185, 28, 28] },
  blue: { bg: [219, 234, 254], texto: [29, 78, 216] },
  gray: { bg: [243, 244, 246], texto: [55, 65, 81] },
};

function desenharBadgePdf(doc: jsPDF, texto: string, tone: PdfBadgeTone, cx: number, cy: number): void {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  const textWidth = doc.getTextWidth(texto);
  const paddingX = 3;
  const boxWidth = textWidth + paddingX * 2;
  const boxHeight = 5;
  const boxX = cx - boxWidth / 2;
  const boxY = cy - boxHeight / 2;

  const { bg, texto: corTexto } = BADGE_COLORS[tone];
  doc.setFillColor(...bg);
  doc.roundedRect(boxX, boxY, boxWidth, boxHeight, boxHeight / 2, boxHeight / 2, "F");
  doc.setTextColor(...corTexto);
  doc.text(texto, cx, cy + 1.6, { align: "center" });
}

/**
 * Hooks de autoTable pra desenhar uma coluna como badge colorido (pill) em vez de texto puro.
 * Passar em didParseCell/didDrawCell nas opções da tabela.
 */
export function criarColunaBadgePdf(colIndex: number, toneMap: Record<string, PdfBadgeTone>) {
  return {
    didParseCell: (data: { section: string; column: { index: number }; cell: { text: string[] } }) => {
      if (data.section === "body" && data.column.index === colIndex) {
        data.cell.text = [];
      }
    },
    didDrawCell: (data: {
      section: string;
      column: { index: number };
      cell: { raw: unknown; x: number; y: number; width: number; height: number };
      doc: jsPDF;
    }) => {
      if (data.section !== "body" || data.column.index !== colIndex) return;
      const texto = String(data.cell.raw ?? "");
      const tone = toneMap[texto] ?? "gray";
      const cx = data.cell.x + data.cell.width / 2;
      const cy = data.cell.y + data.cell.height / 2;
      desenharBadgePdf(data.doc, texto, tone, cx, cy);
    },
  };
}
