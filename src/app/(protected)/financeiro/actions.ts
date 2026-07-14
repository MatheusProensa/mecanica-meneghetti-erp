"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { uploadDespesaAnexo, deleteDespesaAnexo } from "@/lib/supabase-storage";

const ALLOWED_ANEXO_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") return null;
  return value.trim();
}

function parseItens(formData: FormData) {
  const descricoes = formData.getAll("itemDescricao") as string[];
  const valores = formData.getAll("itemValor") as string[];

  return descricoes
    .map((descricao, i) => ({
      descricao: descricao.trim(),
      valor: Number(valores[i]?.replace(",", ".") || 0),
    }))
    .filter((item) => item.descricao !== "" && item.valor > 0);
}

async function saveAnexoIfPresent(formData: FormData): Promise<string | null> {
  const file = formData.get("anexo");
  if (!(file instanceof File) || file.size === 0) return null;
  if (!ALLOWED_ANEXO_TYPES.has(file.type)) {
    throw new Error("O anexo precisa ser um PDF ou uma imagem (JPG, PNG, WEBP, GIF)");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `${randomUUID()}-${safeName}`;

  return uploadDespesaAnexo(fileName, bytes, file.type);
}

function buildData(formData: FormData) {
  const dataRaw = str(formData, "data");
  const valorRaw = str(formData, "valor");

  return {
    descricao: str(formData, "descricao") ?? "",
    valor: valorRaw ? Number(valorRaw.replace(",", ".")) : 0,
    data: dataRaw ? new Date(dataRaw) : new Date(),
    categoria: str(formData, "categoria"),
    fornecedor: str(formData, "fornecedor"),
    formaPagamento: str(formData, "formaPagamento"),
    observacoes: str(formData, "observacoes"),
  };
}

export async function createDespesa(formData: FormData) {
  const data = buildData(formData);
  if (!data.descricao) throw new Error("Descrição é obrigatória");
  if (data.valor <= 0) throw new Error("Valor precisa ser maior que zero");

  const itens = parseItens(formData);
  const anexoPath = await saveAnexoIfPresent(formData);

  await prisma.despesa.create({
    data: {
      ...data,
      anexoPath,
      itens: itens.length > 0 ? { create: itens } : undefined,
    },
  });

  revalidatePath("/financeiro");
  revalidatePath("/");
  redirect(`/financeiro?sucesso=${encodeURIComponent("Despesa cadastrada")}`);
}

export async function updateDespesa(id: string, formData: FormData) {
  const data = buildData(formData);
  if (!data.descricao) throw new Error("Descrição é obrigatória");
  if (data.valor <= 0) throw new Error("Valor precisa ser maior que zero");

  const itens = parseItens(formData);
  const removerAnexo = formData.get("removerAnexo") === "on";
  const novoAnexo = await saveAnexoIfPresent(formData);

  const existing = await prisma.despesa.findUniqueOrThrow({ where: { id } });
  if ((novoAnexo || removerAnexo) && existing.anexoPath) {
    await deleteDespesaAnexo(existing.anexoPath).catch(() => {});
  }

  await prisma.$transaction([
    prisma.despesaItem.deleteMany({ where: { despesaId: id } }),
    prisma.despesa.update({
      where: { id },
      data: {
        ...data,
        anexoPath: novoAnexo ?? (removerAnexo ? null : undefined),
        itens: itens.length > 0 ? { create: itens } : undefined,
      },
    }),
  ]);

  revalidatePath("/financeiro");
  revalidatePath("/");
  redirect(`/financeiro?sucesso=${encodeURIComponent("Despesa atualizada")}`);
}

export async function deleteDespesa(id: string) {
  const existing = await prisma.despesa.findUniqueOrThrow({ where: { id } });
  await prisma.despesa.delete({ where: { id } });
  if (existing.anexoPath) {
    await deleteDespesaAnexo(existing.anexoPath).catch(() => {});
  }
  revalidatePath("/financeiro");
  revalidatePath("/");
  redirect(`/financeiro?sucesso=${encodeURIComponent("Despesa excluída")}`);
}
