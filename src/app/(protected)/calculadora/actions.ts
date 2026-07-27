"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";
import { EMPRESA_PADRAO } from "@/lib/business";

/** Salva o valor da hora do torno, pra lembrar da próxima vez que abrir a
 * calculadora — qualquer usuário logado pode ajustar, é só um valor de
 * referência pra cálculo de preço, não dado sensível. */
export async function salvarValorHoraTorno(formData: FormData) {
  await requireAuth();

  const valorHoraRaw = formData.get("valorHoraTorno");
  const valorHoraTorno = typeof valorHoraRaw === "string" ? Number(valorHoraRaw) : NaN;

  if (!Number.isFinite(valorHoraTorno) || valorHoraTorno < 0) {
    throw new Error("Valor da hora inválido");
  }

  await prisma.empresa.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      nome: EMPRESA_PADRAO.nome,
      endereco: EMPRESA_PADRAO.endereco,
      cidade: EMPRESA_PADRAO.cidade,
      telefone: EMPRESA_PADRAO.telefone,
      cnpj: EMPRESA_PADRAO.cnpj,
      valorHoraTorno,
    },
    update: { valorHoraTorno },
  });

  revalidatePath("/calculadora");
}

/** Atualiza o valor do kg de um material cadastrado (Aço 1020, Inox 304 etc). */
export async function salvarValorMaterial(formData: FormData) {
  await requireAuth();

  const id = formData.get("id");
  const valorKgRaw = formData.get("valorKg");
  const valorKg = typeof valorKgRaw === "string" ? Number(valorKgRaw) : NaN;

  if (typeof id !== "string" || !id) throw new Error("Material inválido");
  if (!Number.isFinite(valorKg) || valorKg < 0) throw new Error("Valor do kg inválido");

  await prisma.materialCalculadora.update({ where: { id }, data: { valorKg } });

  revalidatePath("/calculadora");
}
