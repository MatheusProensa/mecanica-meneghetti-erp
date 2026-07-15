import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { EMPRESA } from "./business";
import { formatCurrency, formatDate } from "./format";

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
  cliente: CobrancaCliente;
  ordens: CobrancaOS[];
  pixKey?: string | null;
  observacoes?: string | null;
}

const LOGO_TAMANHO_PX = 220;

/** Carrega a logo e a redesenha em canvas num tamanho menor, exportando como JPEG
 * (com fundo branco no lugar da transparência) — evita embutir no PDF a imagem
 * original de alta resolução, que deixaria o arquivo desnecessariamente pesado. */
async function carregarLogoComprimida(): Promise<string | null> {
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = "/logo.png";
    });

    const canvas = document.createElement("canvas");
    canvas.width = LOGO_TAMANHO_PX;
    canvas.height = LOGO_TAMANHO_PX;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, LOGO_TAMANHO_PX, LOGO_TAMANHO_PX);
    ctx.drawImage(img, 0, 0, LOGO_TAMANHO_PX, LOGO_TAMANHO_PX);

    return canvas.toDataURL("image/jpeg", 0.85);
  } catch {
    return null;
  }
}

export async function gerarCobrancaPdf({
  cliente,
  ordens,
  pixKey,
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
  doc.text(EMPRESA.nome, infoX, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(EMPRESA.endereco, infoX, 24);
  doc.text(`Tel: ${EMPRESA.telefone}  •  CNPJ: ${EMPRESA.cnpj}`, infoX, 29);

  doc.setDrawColor(229, 231, 235);
  doc.line(marginX, 38, pageWidth - marginX, 38);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(17, 24, 39);
  doc.text("Cobrança de Serviços", marginX, 47);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128);
  doc.text(`Emitido em ${formatDate(new Date())}`, pageWidth - marginX, 47, { align: "right" });

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
    head: [["OS", "Data", "Descrição", "Valor"]],
    body: ordens.map((os) => [
      `#${String(os.id).padStart(4, "0")}`,
      formatDate(os.data),
      os.descricao || "-",
      formatCurrency(os.valor),
    ]),
    foot: [["", "", "Total em aberto", formatCurrency(total)]],
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
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(17, 24, 39);
    doc.text("Dados para pagamento", marginX, afterTableY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(55, 65, 81);
    const linhasPix = doc.splitTextToSize(pixKey, pageWidth - marginX * 2);
    doc.text(linhasPix, marginX, afterTableY + 5);
    afterTableY += 5 + linhasPix.length * 4.5 + 5;
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
