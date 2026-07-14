"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") return null;
  return value.trim();
}

function buildData(formData: FormData) {
  const dataRaw = str(formData, "data");
  const valorRaw = str(formData, "valor");

  return {
    descricao: str(formData, "descricao") ?? "",
    valor: valorRaw ? Number(valorRaw.replace(",", ".")) : 0,
    data: dataRaw ? new Date(dataRaw) : new Date(),
    categoria: str(formData, "categoria"),
  };
}

export async function createDespesa(formData: FormData) {
  const data = buildData(formData);
  if (!data.descricao) throw new Error("Descrição é obrigatória");
  if (data.valor <= 0) throw new Error("Valor precisa ser maior que zero");

  await prisma.despesa.create({ data });

  revalidatePath("/financeiro");
  revalidatePath("/");
  redirect(`/financeiro?sucesso=${encodeURIComponent("Despesa cadastrada")}`);
}

export async function updateDespesa(id: string, formData: FormData) {
  const data = buildData(formData);
  if (!data.descricao) throw new Error("Descrição é obrigatória");
  if (data.valor <= 0) throw new Error("Valor precisa ser maior que zero");

  await prisma.despesa.update({ where: { id }, data });

  revalidatePath("/financeiro");
  revalidatePath("/");
  redirect(`/financeiro?sucesso=${encodeURIComponent("Despesa atualizada")}`);
}

export async function deleteDespesa(id: string) {
  await prisma.despesa.delete({ where: { id } });
  revalidatePath("/financeiro");
  revalidatePath("/");
  redirect(`/financeiro?sucesso=${encodeURIComponent("Despesa excluída")}`);
}
