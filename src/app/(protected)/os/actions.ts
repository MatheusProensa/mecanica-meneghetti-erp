"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { StatusOS } from "@/generated/prisma/client";
import { parseCurrencyBR } from "@/lib/format";
import { requirePermission } from "@/lib/requireAuth";
import { uploadOSFoto, deleteOSFoto } from "@/lib/supabase-storage";
import { assinaturaCondizComTipo } from "@/lib/fileSignature";

const ALLOWED_FOTO_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const STATUS_VALIDOS: StatusOS[] = [
  "aberta",
  "em_andamento",
  "aguardando_peca",
  "aguardando_cliente",
  "concluida",
  "entregue",
  "cancelada",
];

function statusOS(formData: FormData): StatusOS {
  const value = formData.get("status");
  if (typeof value === "string" && STATUS_VALIDOS.includes(value as StatusOS)) {
    return value as StatusOS;
  }
  return "aberta";
}

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") return null;
  return value.trim();
}

function parseItens(formData: FormData) {
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

export async function createOS(formData: FormData) {
  await requirePermission("verOS");
  await requirePermission("editarOS");
  const clienteId = str(formData, "clienteId");
  if (!clienteId) throw new Error("Cliente é obrigatório");

  const itens = parseItens(formData);
  if (itens.length === 0) throw new Error("Adicione ao menos um item de serviço");

  const previsaoEntregaRaw = str(formData, "previsaoEntrega");
  const osDataRaw = str(formData, "osData");

  const os = await prisma.ordemServico.create({
    data: {
      clienteId,
      ...(osDataRaw ? { data: new Date(osDataRaw) } : {}),
      telefone: str(formData, "telefone"),
      status: statusOS(formData),
      mecanicoId: str(formData, "mecanicoId"),
      formaPagamento: str(formData, "formaPagamento"),
      observacoes: str(formData, "observacoes"),
      previsaoEntrega: previsaoEntregaRaw ? new Date(previsaoEntregaRaw) : null,
      itens: { create: itens },
    },
  });

  revalidatePath("/os");
  revalidatePath("/");
  redirect(`/os/${os.id}?sucesso=${encodeURIComponent("Ordem de serviço criada")}`);
}

export async function updateOS(id: number, formData: FormData) {
  await requirePermission("verOS");
  await requirePermission("editarOS");
  const clienteId = str(formData, "clienteId");
  if (!clienteId) throw new Error("Cliente é obrigatório");

  const itens = parseItens(formData);
  if (itens.length === 0) throw new Error("Adicione ao menos um item de serviço");

  const previsaoEntregaRaw = str(formData, "previsaoEntrega");
  const osDataRaw = str(formData, "osData");

  await prisma.$transaction([
    prisma.itemServico.deleteMany({ where: { ordemServicoId: id } }),
    prisma.ordemServico.update({
      where: { id },
      data: {
        clienteId,
        ...(osDataRaw ? { data: new Date(osDataRaw) } : {}),
        telefone: str(formData, "telefone"),
        status: statusOS(formData),
        mecanicoId: str(formData, "mecanicoId"),
        formaPagamento: str(formData, "formaPagamento"),
        observacoes: str(formData, "observacoes"),
        previsaoEntrega: previsaoEntregaRaw ? new Date(previsaoEntregaRaw) : null,
        itens: { create: itens },
      },
    }),
  ]);

  revalidatePath("/os");
  revalidatePath(`/os/${id}`);
  revalidatePath("/");
  redirect(`/os/${id}?sucesso=${encodeURIComponent("Ordem de serviço atualizada")}`);
}

export async function updateOSStatus(id: number, status: StatusOS) {
  await requirePermission("verOS");
  await requirePermission("editarOS");
  if (!STATUS_VALIDOS.includes(status)) throw new Error("Status inválido");
  await prisma.ordemServico.update({ where: { id }, data: { status } });
  revalidatePath("/os");
  revalidatePath(`/os/${id}`);
  revalidatePath("/");
}

export async function toggleOSPago(id: number, pago: boolean) {
  await requirePermission("verOS");
  await requirePermission("editarOS");
  await prisma.ordemServico.update({
    where: { id },
    data: { pago, dataPagamento: pago ? new Date() : null },
  });
  revalidatePath("/os");
  revalidatePath(`/os/${id}`);
  revalidatePath("/");
  revalidatePath("/financeiro");
}

export async function deleteOS(id: number) {
  await requirePermission("verOS");
  await requirePermission("excluirOS");
  const anexos = await prisma.anexoOS.findMany({ where: { ordemServicoId: id } });
  await prisma.ordemServico.delete({ where: { id } });
  await Promise.all(anexos.map((a) => deleteOSFoto(a.path).catch(() => {})));
  revalidatePath("/os");
  revalidatePath("/");
  redirect(`/os?sucesso=${encodeURIComponent("Ordem de serviço excluída")}`);
}

export async function addAnexoOS(id: number, formData: FormData) {
  await requirePermission("verOS");
  await requirePermission("editarOS");
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
  const fileName = `os-${id}-${randomUUID()}-${safeName}`;
  const path = await uploadOSFoto(fileName, bytes, file.type);

  await prisma.anexoOS.create({ data: { ordemServicoId: id, path } });
  revalidatePath(`/os/${id}`);
}

export async function deleteAnexoOS(id: string, osId: number) {
  await requirePermission("verOS");
  await requirePermission("excluirOS");
  const anexo = await prisma.anexoOS.findUniqueOrThrow({ where: { id } });
  await prisma.anexoOS.delete({ where: { id } });
  await deleteOSFoto(anexo.path).catch(() => {});
  revalidatePath(`/os/${osId}`);
}
