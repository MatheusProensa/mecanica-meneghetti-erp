"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/requireAuth";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") return null;
  return value.trim();
}

export async function createMecanico(formData: FormData) {
  await requirePermission("acessarConfiguracoes");
  const nome = str(formData, "nome");
  if (!nome) throw new Error("Nome é obrigatório");

  await prisma.mecanico.create({ data: { nome } });
  revalidatePath("/configuracoes");
}

export async function toggleMecanicoAtivo(id: string, ativo: boolean) {
  await requirePermission("acessarConfiguracoes");
  await prisma.mecanico.update({ where: { id }, data: { ativo } });
  revalidatePath("/configuracoes");
}

export async function deleteMecanico(id: string) {
  await requirePermission("acessarConfiguracoes");
  const qtdExtras = await prisma.extraFuncionario.count({ where: { mecanicoId: id } });
  if (qtdExtras > 0) {
    throw new Error(
      "Não é possível excluir: este mecânico tem extras vinculados. Exclua-os primeiro."
    );
  }
  await prisma.ordemServico.updateMany({ where: { mecanicoId: id }, data: { mecanicoId: null } });
  await prisma.mecanico.delete({ where: { id } });
  revalidatePath("/configuracoes");
  revalidatePath("/os");
}
