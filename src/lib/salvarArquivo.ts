/** Dispara o download de bytes de PDF no navegador (equivalente ao antigo doc.save() do jsPDF). */
export function salvarPdfBytes(bytes: Uint8Array, fileName: string): void {
  const blob = new Blob([Uint8Array.from(bytes)], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
