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

function parseItensDivida(formData: FormData) {
  const datas = formData.getAll("data") as string[];
  const descricoes = formData.getAll("descricao") as string[];
  const valores = formData.getAll("valor") as string[];

  return datas
    .map((dataRaw, i) => ({
      data: dataRaw ? new Date(dataRaw) : null,
      descricao: (descricoes[i] ?? "").trim(),
      valor: parseCurrencyBR(valores[i]),
    }))
    .filter(
      (item): item is { data: Date; descricao: string; valor: number } =>
        item.data !== null && item.descricao !== "" && item.valor > 0
    );
}

export async function createDivida(formData: FormData) {
  await requirePermission("verDevedores");
  await requirePermission("editarDevedores");
  const clienteId = str(formData, "clienteId");
  if (!clienteId) throw new Error("Cliente é obrigatório");

  const itens = parseItensDivida(formData);
  if (itens.length === 0) throw new Error("Adicione ao menos um item com data, descrição e valor");

  const divida = await prisma.divida.create({
    data: {
      clienteId,
      observacoes: str(formData, "observacoes"),
      itens: { create: itens },
    },
  });

  revalidatePath("/devedores");
  redirect(`/devedores/${divida.id}?sucesso=${encodeURIComponent("Dívida cadastrada")}`);
}

export async function updateDivida(id: string, formData: FormData) {
  await requirePermission("verDevedores");
  await requirePermission("editarDevedores");
  const clienteId = str(formData, "clienteId");
  if (!clienteId) throw new Error("Cliente é obrigatório");

  const itens = parseItensDivida(formData);
  if (itens.length === 0) throw new Error("Adicione ao menos um item com data, descrição e valor");

  await prisma.$transaction([
    prisma.itemDivida.deleteMany({ where: { dividaId: id } }),
    prisma.divida.update({
      where: { id },
      data: {
        clienteId,
        observacoes: str(formData, "observacoes"),
        itens: { create: itens },
      },
    }),
  ]);

  revalidatePath("/devedores");
  revalidatePath(`/devedores/${id}`);
  redirect(`/devedores/${id}?sucesso=${encodeURIComponent("Dívida atualizada")}`);
}

export async function deleteDivida(id: string) {
  await requirePermission("verDevedores");
  await requirePermission("excluirDevedores");
  const anexos = await prisma.anexoDivida.findMany({ where: { dividaId: id } });
  await prisma.divida.delete({ where: { id } });
  await Promise.all(anexos.map((a) => deleteDividaFoto(a.path).catch(() => {})));

  revalidatePath("/devedores");
  redirect(`/devedores?sucesso=${encodeURIComponent("Dívida excluída")}`);
}

export async function addPagamento(dividaId: string, formData: FormData) {
  await requirePermission("verDevedores");
  await requirePermission("editarDevedores");

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
  await requirePermission("verDevedores");
  await requirePermission("excluirDevedores");
  await prisma.pagamentoDivida.delete({ where: { id, dividaId } });

  revalidatePath(`/devedores/${dividaId}`);
  revalidatePath("/devedores");
}

export async function addAnexoDivida(id: string, formData: FormData) {
  await requirePermission("verDevedores");
  await requirePermission("editarDevedores");
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
  await requirePermission("verDevedores");
  await requirePermission("excluirDevedores");
  const anexo = await prisma.anexoDivida.findUniqueOrThrow({ where: { id } });
  await prisma.anexoDivida.delete({ where: { id } });
  await deleteDividaFoto(anexo.path).catch(() => {});
  revalidatePath(`/devedores/${dividaId}`);
}
