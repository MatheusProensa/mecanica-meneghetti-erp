"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") return null;
  return value.trim();
}

export async function createMecanico(formData: FormData) {
  await requireAuth();
  const nome = str(formData, "nome");
  if (!nome) throw new Error("Nome é obrigatório");

  await prisma.mecanico.create({ data: { nome } });
  revalidatePath("/mecanicos");
}

export async function toggleMecanicoAtivo(id: string, ativo: boolean) {
  await requireAuth();
  await prisma.mecanico.update({ where: { id }, data: { ativo } });
  revalidatePath("/mecanicos");
}

export async function deleteMecanico(id: string) {
  await requireAuth();
  await prisma.ordemServico.updateMany({ where: { mecanicoId: id }, data: { mecanicoId: null } });
  await prisma.mecanico.delete({ where: { id } });
  revalidatePath("/mecanicos");
  revalidatePath("/os");
}
