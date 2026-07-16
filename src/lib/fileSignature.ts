/** Confere a assinatura binária (magic bytes) do arquivo, em vez de confiar só no
 * Content-Type que o navegador declarou (fácil de forjar numa requisição manual). */
export function assinaturaCondizComTipo(bytes: Buffer, mimeType: string): boolean {
  const header = bytes.subarray(0, 12);

  switch (mimeType) {
    case "application/pdf":
      return header.subarray(0, 5).toString("latin1") === "%PDF-";
    case "image/jpeg":
      return header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff;
    case "image/png":
      return header
        .subarray(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
    case "image/gif":
      return ["GIF87a", "GIF89a"].includes(header.subarray(0, 6).toString("latin1"));
    case "image/webp":
      return (
        header.subarray(0, 4).toString("latin1") === "RIFF" &&
        header.subarray(8, 12).toString("latin1") === "WEBP"
      );
    default:
      return false;
  }
}
