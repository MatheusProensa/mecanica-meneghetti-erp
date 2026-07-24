"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

/** Salva o valor da hora do torno e/ou do kg da barra redonda, pra lembrar da
 * próxima vez que abrir a calculadora — qualquer usuário logado pode ajustar,
 * é só um valor de referência pra cálculo de preço, não dado sensível. */
export async function salvarValoresCalculadora(formData: FormData) {
  await requireAuth();

  const valorHoraRaw = formData.get("valorHoraTorno");
  const valorKgRaw = formData.get("valorKgBarraRedonda");

  const valorHoraTorno = typeof valorHoraRaw === "string" ? Number(valorHoraRaw) : NaN;
  const valorKgBarraRedonda = typeof valorKgRaw === "string" ? Number(valorKgRaw) : NaN;

  if (!Number.isFinite(valorHoraTorno) || valorHoraTorno < 0) {
    throw new Error("Valor da hora inválido");
  }
  if (!Number.isFinite(valorKgBarraRedonda) || valorKgBarraRedonda < 0) {
    throw new Error("Valor do kg inválido");
  }

  await prisma.empresa.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      nome: "",
      endereco: "",
      cidade: "",
      telefone: "",
      cnpj: "",
      valorHoraTorno,
      valorKgBarraRedonda,
    },
    update: { valorHoraTorno, valorKgBarraRedonda },
  });

  revalidatePath("/calculadora");
}
