"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/requireAuth";

export async function updatePassword(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const session = await auth();
  if (!session?.user?.email) return "Sessão inválida. Faça login novamente.";

  const senhaAtual = formData.get("senhaAtual");
  const novaSenha = formData.get("novaSenha");
  const confirmarSenha = formData.get("confirmarSenha");

  if (
    typeof senhaAtual !== "string" ||
    typeof novaSenha !== "string" ||
    typeof confirmarSenha !== "string" ||
    !senhaAtual ||
    !novaSenha
  ) {
    return "Preencha todos os campos.";
  }

  if (novaSenha.length < 8) {
    return "A nova senha precisa ter pelo menos 8 caracteres.";
  }

  if (novaSenha !== confirmarSenha) {
    return "A confirmação não bate com a nova senha.";
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return "Usuário não encontrado.";

  const senhaValida = await bcrypt.compare(senhaAtual, user.passwordHash);
  if (!senhaValida) return "Senha atual incorreta.";

  const passwordHash = await bcrypt.hash(novaSenha, 10);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

  return "Senha atualizada com sucesso.";
}

export async function updatePixKey(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const session = await auth();
  if (!session?.user?.email) return "Sessão inválida. Faça login novamente.";
  try {
    await requirePermission("acessarConfiguracoes");
  } catch {
    return "Você não tem permissão para alterar dados de pagamento.";
  }

  const pixKeyRaw = formData.get("pixKey");
  const pixKey = typeof pixKeyRaw === "string" && pixKeyRaw.trim() ? pixKeyRaw.trim() : null;

  const dadosBancariosRaw = formData.get("dadosBancarios");
  const dadosBancarios =
    typeof dadosBancariosRaw === "string" && dadosBancariosRaw.trim()
      ? dadosBancariosRaw.trim()
      : null;

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) return "Sessão desatualizada. Saia e entre novamente para continuar.";

  await prisma.user.update({
    where: { id: user.id },
    data: { pixKey, dadosBancarios },
  });

  revalidatePath("/configuracoes");
  return "Dados de pagamento atualizados com sucesso.";
}

export async function updateEmpresa(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const session = await auth();
  if (!session?.user?.email) return "Sessão inválida. Faça login novamente.";
  try {
    await requirePermission("acessarConfiguracoes");
  } catch {
    return "Você não tem permissão para alterar os dados da empresa.";
  }

  function campo(nome: string): string {
    const value = formData.get(nome);
    return typeof value === "string" ? value.trim() : "";
  }

  const nome = campo("nome");
  const endereco = campo("endereco");
  const cidade = campo("cidade");
  const telefone = campo("telefone");
  const cnpj = campo("cnpj");

  if (!nome || !endereco || !cidade || !telefone) {
    return "Preencha nome, endereço, cidade e telefone.";
  }

  await prisma.empresa.upsert({
    where: { id: "default" },
    create: { id: "default", nome, endereco, cidade, telefone, cnpj },
    update: { nome, endereco, cidade, telefone, cnpj },
  });

  revalidatePath("/configuracoes");
  return "Dados da empresa atualizados com sucesso.";
}
