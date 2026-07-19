"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { parseCurrencyBR } from "@/lib/format";
import { requirePermission } from "@/lib/requireAuth";
import { uploadDividaFoto, deleteDividaFoto } from "@/lib/supabase-storage";
import { assinaturaCondizComTipo } from "@/lib/fileSignature";

const ALLOWED_FOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") return null;
  return value.trim();
}

function buildDividaData(formData: FormData) {
  const clienteId = str(formData, "clienteId");
  const dataServicoRaw = str(formData, "dataServico");
  const valorOriginal = parseCurrencyBR(str(formData, "valorOriginal"));

  return {
    clienteId,
    dataServico: dataServicoRaw ? new Date(dataServicoRaw) : new Date(),
    valorOriginal,
    observacoes: str(formData, "observacoes"),
  };
}

export async function createDivida(formData: FormData) {
  await requirePermission("verFinanceiro");
  await requirePermission("editar");
  const data = buildDividaData(formData);
  if (!data.clienteId) throw new Error("Cliente é obrigatório");
  if (data.valorOriginal <= 0) throw new Error("Valor original precisa ser maior que zero");

  const divida = await prisma.divida.create({
    data: { ...data, clienteId: data.clienteId },
  });

  revalidatePath("/devedores");
  redirect(`/devedores/${divida.id}?sucesso=${encodeURIComponent("Dívida cadastrada")}`);
}

export async function updateDivida(id: string, formData: FormData) {
  await requirePermission("verFinanceiro");
  await requirePermission("editar");
  const data = buildDividaData(formData);
  if (!data.clienteId) throw new Error("Cliente é obrigatório");
  if (data.valorOriginal <= 0) throw new Error("Valor original precisa ser maior que zero");

  await prisma.divida.update({
    where: { id },
    data: { ...data, clienteId: data.clienteId },
  });

  revalidatePath("/devedores");
  revalidatePath(`/devedores/${id}`);
  redirect(`/devedores/${id}?sucesso=${encodeURIComponent("Dívida atualizada")}`);
}

export async function deleteDivida(id: string) {
  await requirePermission("verFinanceiro");
  await requirePermission("excluir");
  await prisma.divida.delete({ where: { id } });

  revalidatePath("/devedores");
  redirect(`/devedores?sucesso=${encodeURIComponent("Dívida excluída")}`);
}

export async function addPagamento(dividaId: string, formData: FormData) {
  await requirePermission("verFinanceiro");
  await requirePermission("editar");

  const dataRaw = str(formData, "data");
  const valor = parseCurrencyBR(str(formData, "valor"));
  if (valor <= 0) throw new Error("Valor do pagamento precisa ser maior que zero");

  await prisma.pagamentoDivida.create({
    data: {
      dividaId,
      data: dataRaw ? new Date(dataRaw) : new Date(),
      valor,
      formaPagamento: str(formData, "formaPagamento"),
      observacao: str(formData, "observacao"),
    },
  });

  revalidatePath(`/devedores/${dividaId}`);
  revalidatePath("/devedores");
}

export async function deletePagamento(id: string, dividaId: string) {
  await requirePermission("verFinanceiro");
  await requirePermission("excluir");
  await prisma.pagamentoDivida.delete({ where: { id } });

  revalidatePath(`/devedores/${dividaId}`);
  revalidatePath("/devedores");
}

export async function addAnexoDivida(id: string, formData: FormData) {
  await requirePermission("verFinanceiro");
  await requirePermission("editar");
  const file = formData.get("foto");
  if (!(file instanceof File) || file.size === 0) throw new Error("Selecione uma foto");
  if (!ALLOWED_FOTO_TYPES.has(file.type)) {
    throw new Error("A foto precisa ser uma imagem (JPG, PNG, WEBP ou GIF)");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  if (!assinaturaCondizComTipo(bytes, file.type)) {
    throw new Error("O arquivo enviado não corresponde a uma imagem válida");
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `divida-${id}-${randomUUID()}-${safeName}`;
  const path = await uploadDividaFoto(fileName, bytes, file.type);

  await prisma.anexoDivida.create({ data: { dividaId: id, path } });
  revalidatePath(`/devedores/${id}`);
}

export async function deleteAnexoDivida(id: string, dividaId: string) {
  await requirePermission("verFinanceiro");
  await requirePermission("excluir");
  const anexo = await prisma.anexoDivida.findUniqueOrThrow({ where: { id } });
  await prisma.anexoDivida.delete({ where: { id } });
  await deleteDividaFoto(anexo.path).catch(() => {});
  revalidatePath(`/devedores/${dividaId}`);
}
