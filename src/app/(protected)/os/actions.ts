"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import type { StatusOS } from "@/generated/prisma/client";
import { parseCurrencyBR } from "@/lib/format";

function str(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") return null;
  return value.trim();
}

function parseItens(formData: FormData) {
  const descricoes = formData.getAll("descricao") as string[];
  const valores = formData.getAll("valor") as string[];

  return descricoes
    .map((descricao, i) => ({
      descricao: descricao.trim(),
      valor: parseCurrencyBR(valores[i]),
    }))
    .filter((item) => item.descricao !== "" && item.valor > 0);
}

export async function createOS(formData: FormData) {
  const clienteId = str(formData, "clienteId");
  if (!clienteId) throw new Error("Cliente é obrigatório");

  const itens = parseItens(formData);
  if (itens.length === 0) throw new Error("Adicione ao menos um item de serviço");

  const previsaoEntregaRaw = str(formData, "previsaoEntrega");

  const os = await prisma.ordemServico.create({
    data: {
      clienteId,
      telefone: str(formData, "telefone"),
      status: (str(formData, "status") as StatusOS) ?? "aberta",
      mecanicoResponsavel: str(formData, "mecanicoResponsavel"),
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
  const clienteId = str(formData, "clienteId");
  if (!clienteId) throw new Error("Cliente é obrigatório");

  const itens = parseItens(formData);
  if (itens.length === 0) throw new Error("Adicione ao menos um item de serviço");

  const previsaoEntregaRaw = str(formData, "previsaoEntrega");

  await prisma.$transaction([
    prisma.itemServico.deleteMany({ where: { ordemServicoId: id } }),
    prisma.ordemServico.update({
      where: { id },
      data: {
        clienteId,
        telefone: str(formData, "telefone"),
        status: (str(formData, "status") as StatusOS) ?? "aberta",
        mecanicoResponsavel: str(formData, "mecanicoResponsavel"),
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
  await prisma.ordemServico.update({ where: { id }, data: { status } });
  revalidatePath("/os");
  revalidatePath(`/os/${id}`);
  revalidatePath("/");
}

export async function toggleOSPago(id: number, pago: boolean) {
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
  await prisma.ordemServico.delete({ where: { id } });
  revalidatePath("/os");
  revalidatePath("/");
  redirect(`/os?sucesso=${encodeURIComponent("Ordem de serviço excluída")}`);
}
