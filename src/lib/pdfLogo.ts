const LOGO_TAMANHO_PX = 220;

/** Carrega a logo e a redesenha em canvas num tamanho menor, exportando como PNG
 * (mantendo a transparência) — evita embutir no PDF a imagem original de alta
 * resolução, que deixaria o arquivo desnecessariamente pesado. Precisa manter
 * transparência porque a logo é usada sobre o cabeçalho navy dos PDFs — um fundo
 * branco forçado (como um JPEG exigiria) apareceria como uma caixa feia atrás dela. */
export async function carregarLogoComprimida(): Promise<string | null> {
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

    ctx.drawImage(img, 0, 0, LOGO_TAMANHO_PX, LOGO_TAMANHO_PX);

    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}
