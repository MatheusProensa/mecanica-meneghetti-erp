"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { uploadPdf, deletePdf } from "@/lib/supabase-storage";
import { parseCurrencyBR } from "@/lib/format";
import type { TipoNota } from "@/generated/prisma/client";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") return null;
  return value.trim();
}

async function savePdfIfPresent(formData: FormData): Promise<string | null> {
  const file = formData.get("arquivoPdf");
  if (!(file instanceof File) || file.size === 0) return null;
  if (file.type !== "application/pdf") {
    throw new Error("O anexo precisa ser um arquivo PDF");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${randomUUID()}-${safeName}`;

  return uploadPdf(fileName, bytes);
}

function buildData(formData: FormData) {
  const dataEmissaoRaw = str(formData, "dataEmissao");
  const valorRaw = str(formData, "valor");

  return {
    numero: str(formData, "numero") ?? "",
    dataEmissao: dataEmissaoRaw ? new Date(dataEmissaoRaw) : new Date(),
    tipo: (str(formData, "tipo") as TipoNota) ?? "emitida",
    valor: valorRaw ? parseCurrencyBR(valorRaw) : null,
    observacoes: str(formData, "observacoes"),
  };
}

export async function createNota(formData: FormData) {
  const data = buildData(formData);
  if (!data.numero) throw new Error("Número da nota é obrigatório");

  const arquivoPdfPath = await savePdfIfPresent(formData);

  const nota = await prisma.nota.create({
    data: { ...data, arquivoPdfPath },
  });

  revalidatePath("/notas");
  redirect(`/notas/${nota.id}?sucesso=${encodeURIComponent("Nota cadastrada")}`);
}

export async function updateNota(id: string, formData: FormData) {
  const data = buildData(formData);
  if (!data.numero) throw new Error("Número da nota é obrigatório");

  const removerArquivo = formData.get("removerArquivo") === "on";
  const novoArquivo = await savePdfIfPresent(formData);

  const existing = await prisma.nota.findUniqueOrThrow({ where: { id } });
  if ((novoArquivo || removerArquivo) && existing.arquivoPdfPath) {
    await deletePdf(existing.arquivoPdfPath).catch(() => {});
  }

  await prisma.nota.update({
    where: { id },
    data: {
      ...data,
      arquivoPdfPath: novoArquivo ?? (removerArquivo ? null : undefined),
    },
  });

  revalidatePath("/notas");
  revalidatePath(`/notas/${id}`);
  redirect(`/notas/${id}?sucesso=${encodeURIComponent("Nota atualizada")}`);
}

export async function deleteNota(id: string) {
  const existing = await prisma.nota.findUniqueOrThrow({ where: { id } });
  await prisma.nota.delete({ where: { id } });
  if (existing.arquivoPdfPath) {
    await deletePdf(existing.arquivoPdfPath).catch(() => {});
  }
  revalidatePath("/notas");
  redirect(`/notas?sucesso=${encodeURIComponent("Nota excluída")}`);
}
