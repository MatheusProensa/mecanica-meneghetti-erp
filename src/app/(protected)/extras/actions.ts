"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseCurrencyBR } from "@/lib/format";
import { requirePermission } from "@/lib/requireAuth";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") return null;
  return value.trim();
}

function buildExtraData(formData: FormData) {
  const mecanicoId = str(formData, "mecanicoId");
  const clienteId = str(formData, "clienteId");
  const ordemServicoIdRaw = str(formData, "ordemServicoId");
  const dataRaw = str(formData, "data");

  return {
    mecanicoId,
    clienteId,
    ordemServicoId: ordemServicoIdRaw ? Number(ordemServicoIdRaw) : null,
    data: dataRaw ? new Date(dataRaw) : new Date(),
    descricao: str(formData, "descricao") ?? "",
    valorServico: parseCurrencyBR(str(formData, "valorServico")),
    valorExtra: parseCurrencyBR(str(formData, "valorExtra")),
    outrosCustos: parseCurrencyBR(str(formData, "outrosCustos")),
  };
}

function validarExtraData(data: ReturnType<typeof buildExtraData>) {
  if (!data.mecanicoId) throw new Error("Funcionário é obrigatório");
  if (!data.clienteId && !data.ordemServicoId) {
    throw new Error("Informe um cliente ou uma ordem de serviço");
  }
  if (!data.descricao) throw new Error("Descrição do serviço é obrigatória");
  if (data.valorServico <= 0) throw new Error("Valor do serviço precisa ser maior que zero");
  if (data.valorExtra <= 0) throw new Error("Valor do extra precisa ser maior que zero");
}

export async function createExtra(formData: FormData) {
  await requirePermission("verExtras");
  await requirePermission("editarExtras");
  const data = buildExtraData(formData);
  validarExtraData(data);

  const extra = await prisma.extraFuncionario.create({
    data: { ...data, mecanicoId: data.mecanicoId! },
  });

  revalidatePath("/extras");
  redirect(`/extras/${extra.id}?sucesso=${encodeURIComponent("Extra cadastrado")}`);
}

export async function updateExtra(id: string, formData: FormData) {
  await requirePermission("verExtras");
  await requirePermission("editarExtras");
  const data = buildExtraData(formData);
  validarExtraData(data);

  await prisma.extraFuncionario.update({
    where: { id },
    data: { ...data, mecanicoId: data.mecanicoId! },
  });

  revalidatePath("/extras");
  revalidatePath(`/extras/${id}`);
  redirect(`/extras/${id}?sucesso=${encodeURIComponent("Extra atualizado")}`);
}

export async function deleteExtra(id: string) {
  await requirePermission("verExtras");
  await requirePermission("excluirExtras");
  await prisma.extraFuncionario.delete({ where: { id } });

  revalidatePath("/extras");
  redirect(`/extras?sucesso=${encodeURIComponent("Extra excluído")}`);
}

export async function addPagamentoExtra(extraId: string, formData: FormData) {
  await requirePermission("verExtras");
  await requirePermission("editarExtras");

  const dataRaw = str(formData, "data");
  const valor = parseCurrencyBR(str(formData, "valor"));
  if (valor <= 0) throw new Error("Valor do pagamento precisa ser maior que zero");

  await prisma.pagamentoExtra.create({
    data: {
      extraId,
      data: dataRaw ? new Date(dataRaw) : new Date(),
      valor,
      formaPagamento: str(formData, "formaPagamento"),
    },
  });

  revalidatePath(`/extras/${extraId}`);
  revalidatePath("/extras");
}

export async function deletePagamentoExtra(id: string, extraId: string) {
  await requirePermission("verExtras");
  await requirePermission("excluirExtras");
  await prisma.pagamentoExtra.delete({ where: { id } });

  revalidatePath(`/extras/${extraId}`);
  revalidatePath("/extras");
}
