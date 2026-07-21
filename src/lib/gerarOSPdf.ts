import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { DadosEmpresa } from "./business";
import { formatCurrency, formatDate } from "./format";
import { carregarLogoComprimida } from "./pdfLogo";
import {
  desenharCabecalhoPdf,
  desenharRodapePdf,
  desenharTotalPdf,
  PDF_MARGIN_X,
  TABLE_BODY_STYLES,
  TABLE_HEAD_STYLES,
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
    subtitulo: periodoLabel ? `${periodoLabel} · Emitido em ${emitidoEm}` : `Emitido em ${emitidoEm}`,
    logoBase64,
  });

  const valorTotal = ordens.reduce((s, os) => s + os.valor, 0);

  autoTable(doc, {
    startY: y,
    margin: { left: PDF_MARGIN_X, right: PDF_MARGIN_X },
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
    headStyles: TABLE_HEAD_STYLES,
    columnStyles: {
      0: { cellWidth: 18 },
      2: { cellWidth: 22 },
      5: { cellWidth: 26, halign: "right" },
    },
    styles: TABLE_BODY_STYLES,
    theme: "plain",
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const finalY = (doc as any).lastAutoTable.finalY + 8;
  desenharTotalPdf(doc, { label: "Total", valor: formatCurrency(valorTotal), y: finalY });
  desenharRodapePdf(doc, `${empresa.nome} · ${empresa.endereco} · CNPJ ${empresa.cnpj}`);

  return doc;
}
