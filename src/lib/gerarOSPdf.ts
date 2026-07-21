import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { DadosEmpresa } from "./business";
import { formatCurrency, formatDate } from "./format";
import { carregarLogoComprimida } from "./pdfLogo";
import {
  criarColunaBadgePdf,
  desenharCabecalhoPdf,
  desenharRodapePdf,
  PDF_MARGIN_X,
  TABLE_BODY_STYLES,
  TABLE_HEAD_STYLES,
  up,
  type PdfBadgeTone,
} from "./pdfShell";

export interface OSLinha {
  id: number;
  clienteNome: string;
  data: Date | string;
  statusLabel: string;
  pagamentoLabel: string;
  valor: number;
}

export interface GerarOSPdfParams {
  empresa: DadosEmpresa;
  periodoLabel: string;
  ordens: OSLinha[];
}

const PAGAMENTO_TONE: Record<string, PdfBadgeTone> = {
  Pago: "green",
  "Em atraso": "red",
  "A receber": "amber",
};

export async function gerarOSPdf({
  empresa,
  periodoLabel,
  ordens,
}: GerarOSPdfParams): Promise<jsPDF> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const logoBase64 = await carregarLogoComprimida();
  const emitidoEm = new Date().toLocaleDateString("pt-BR");
  const y = desenharCabecalhoPdf(doc, {
    titulo: "Ordens de Serviço",
    subtitulo: periodoLabel ? `${periodoLabel} · ${emitidoEm}` : emitidoEm,
    logoBase64,
  });

  const badgeCol = criarColunaBadgePdf(4, PAGAMENTO_TONE);

  autoTable(doc, {
    startY: y,
    margin: { left: PDF_MARGIN_X, right: PDF_MARGIN_X },
    head: [
      [
        up("OS"),
        up("Cliente"),
        up("Data"),
        up("Status"),
        up("Pagamento"),
        { content: up("Valor"), styles: { halign: "right" } },
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
    headStyles: TABLE_HEAD_STYLES,
    columnStyles: {
      0: { cellWidth: 18 },
      2: { cellWidth: 22 },
      4: { halign: "center" },
      5: { cellWidth: 26, halign: "right" },
    },
    styles: TABLE_BODY_STYLES,
    theme: "plain",
    didParseCell: badgeCol.didParseCell,
    didDrawCell: badgeCol.didDrawCell,
  });

  desenharRodapePdf(doc, `${empresa.nome} · ${empresa.endereco} · CNPJ ${empresa.cnpj}`);

  return doc;
}
