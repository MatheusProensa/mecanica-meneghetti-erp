"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") return null;
  return value.trim();
}

export async function createCliente(formData: FormData) {
  const nome = str(formData, "nome");
  if (!nome) throw new Error("Nome é obrigatório");

  const cliente = await prisma.cliente.create({
    data: {
      nome,
      cpfCnpj: str(formData, "cpfCnpj"),
      telefone: str(formData, "telefone"),
      whatsapp: str(formData, "whatsapp"),
      cidade: str(formData, "cidade"),
      endereco: str(formData, "endereco"),
      email: str(formData, "email"),
      observacoes: str(formData, "observacoes"),
    },
  });

  revalidatePath("/clientes");
  redirect(`/clientes/${cliente.id}?sucesso=${encodeURIComponent("Cliente cadastrado com sucesso")}`);
}

export async function updateCliente(id: string, formData: FormData) {
  const nome = str(formData, "nome");
  if (!nome) throw new Error("Nome é obrigatório");

  await prisma.cliente.update({
    where: { id },
    data: {
      nome,
      cpfCnpj: str(formData, "cpfCnpj"),
      telefone: str(formData, "telefone"),
      whatsapp: str(formData, "whatsapp"),
      cidade: str(formData, "cidade"),
      endereco: str(formData, "endereco"),
      email: str(formData, "email"),
      observacoes: str(formData, "observacoes"),
    },
  });

  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
  redirect(`/clientes/${id}?sucesso=${encodeURIComponent("Cliente atualizado")}`);
}

export async function deleteCliente(id: string) {
  try {
    await prisma.cliente.delete({ where: { id } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
      const qtdOS = await prisma.ordemServico.count({ where: { clienteId: id } });
      const mensagem =
        qtdOS > 0
          ? `Não é possível excluir: este cliente tem ${qtdOS} ordem(ns) de serviço vinculada(s). Exclua-as primeiro.`
          : "Não é possível excluir: este cliente possui registros vinculados.";
      redirect(`/clientes/${id}?erro=${encodeURIComponent(mensagem)}`);
    }
    throw e;
  }

  revalidatePath("/clientes");
  redirect(`/clientes?sucesso=${encodeURIComponent("Cliente excluído")}`);
}
