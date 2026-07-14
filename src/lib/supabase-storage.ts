import { createClient } from "@supabase/supabase-js";

const BUCKET = "notas-pdfs";
const SIGNED_URL_EXPIRES_IN = 60 * 60; // 1 hora

function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  return createClient(url, key);
}

/** Envia o PDF para o bucket privado e retorna o caminho salvo (não é uma URL pública). */
export async function uploadPdf(fileName: string, bytes: Buffer): Promise<string> {
  const supabase = getClient();
  const { error } = await supabase.storage.from(BUCKET).upload(fileName, bytes, {
    contentType: "application/pdf",
    upsert: false,
  });
  if (error) throw error;
  return fileName;
}

export async function deletePdf(path: string): Promise<void> {
  const supabase = getClient();
  await supabase.storage.from(BUCKET).remove([path]);
}

/** Gera um link temporário (expira em 1h) para abrir o PDF — usado nas páginas server-side. */
export async function getSignedPdfUrl(path: string): Promise<string | null> {
  const supabase = getClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_EXPIRES_IN);
  if (error) return null;
  return data.signedUrl;
}

/** Versão em lote de getSignedPdfUrl, para listagens com várias notas. */
export async function getSignedPdfUrls(paths: string[]): Promise<Record<string, string>> {
  if (paths.length === 0) return {};
  const supabase = getClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(paths, SIGNED_URL_EXPIRES_IN);
  if (error || !data) return {};

  const map: Record<string, string> = {};
  for (const item of data) {
    if (item.signedUrl && item.path) map[item.path] = item.signedUrl;
  }
  return map;
}
