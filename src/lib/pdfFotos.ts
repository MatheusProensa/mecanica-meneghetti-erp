const FOTO_MAX_LADO_PX = 1400;

/** Carrega uma foto (de uma URL, ex: anexo assinado do Supabase Storage) e a
 * redesenha em canvas, comprimida em JPEG — evita embutir no PDF a foto
 * original em alta resolução de câmera de celular, que deixaria o arquivo
 * pesado demais pra compartilhar. */
export async function carregarFotoComoDataUrl(
  url: string
): Promise<{ dataUrl: string; width: number; height: number } | null> {
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.crossOrigin = "anonymous";
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });

    const escala = Math.min(1, FOTO_MAX_LADO_PX / Math.max(img.naturalWidth, img.naturalHeight));
    const width = Math.round(img.naturalWidth * escala);
    const height = Math.round(img.naturalHeight * escala);
    if (width === 0 || height === 0) return null;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, width, height);

    return { dataUrl: canvas.toDataURL("image/jpeg", 0.82), width, height };
  } catch {
    return null;
  }
}
