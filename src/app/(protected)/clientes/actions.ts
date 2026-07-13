"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

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
  redirect(`/clientes/${cliente.id}`);
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
  redirect(`/clientes/${id}`);
}

export async function deleteCliente(id: string) {
  await prisma.cliente.delete({ where: { id } });
  revalidatePath("/clientes");
  redirect("/clientes");
}
