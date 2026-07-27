"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { requirePermission } from "@/lib/requireAuth";
import { uploadClienteFoto, deleteClienteFoto } from "@/lib/supabase-storage";
import { assinaturaCondizComTipo } from "@/lib/fileSignature";

const ALLOWED_FOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") return null;
  return value.trim();
}

export async function createCliente(formData: FormData) {
  await requirePermission("verClientes");
  await requirePermission("editarClientes");
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
  await requirePermission("verClientes");
  await requirePermission("editarClientes");
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
  await requirePermission("verClientes");
  await requirePermission("excluirClientes");
  try {
    await prisma.cliente.delete({ where: { id } });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
      const [qtdOS, qtdDividas] = await Promise.all([
        prisma.ordemServico.count({ where: { clienteId: id } }),
        prisma.divida.count({ where: { clienteId: id } }),
      ]);
      const pendencias: string[] = [];
      if (qtdOS > 0) pendencias.push(`${qtdOS} ordem(ns) de serviço`);
      if (qtdDividas > 0) pendencias.push(`${qtdDividas} dívida(s)`);
      const mensagem =
        pendencias.length > 0
          ? `Não é possível excluir: este cliente tem ${pendencias.join(" e ")} vinculada(s). Exclua-as primeiro.`
          : "Não é possível excluir: este cliente possui registros vinculados.";
      redirect(`/clientes/${id}?erro=${encodeURIComponent(mensagem)}`);
    }
    throw e;
  }

  revalidatePath("/clientes");
  redirect(`/clientes?sucesso=${encodeURIComponent("Cliente excluído")}`);
}

export async function addAnexoCliente(id: string, formData: FormData) {
  await requirePermission("verClientes");
  await requirePermission("editarClientes");
  const file = formData.get("foto");
  if (!(file instanceof File) || file.size === 0) throw new Error("Selecione um arquivo");
  if (!ALLOWED_FOTO_TYPES.has(file.type)) {
    throw new Error("O arquivo precisa ser uma imagem (JPG, PNG, WEBP ou GIF) ou um PDF");
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  if (!assinaturaCondizComTipo(bytes, file.type)) {
    throw new Error("O arquivo enviado não corresponde a uma imagem ou PDF válido");
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const fileName = `cliente-${id}-${randomUUID()}-${safeName}`;
  const path = await uploadClienteFoto(fileName, bytes, file.type);

  await prisma.anexoCliente.create({ data: { clienteId: id, path } });
  revalidatePath(`/clientes/${id}`);
}

export async function deleteAnexoCliente(id: string, clienteId: string) {
  await requirePermission("verClientes");
  await requirePermission("excluirClientes");
  const anexo = await prisma.anexoCliente.findUniqueOrThrow({ where: { id } });
  await prisma.anexoCliente.delete({ where: { id } });
  await deleteClienteFoto(anexo.path).catch(() => {});
  revalidatePath(`/clientes/${clienteId}`);
}
