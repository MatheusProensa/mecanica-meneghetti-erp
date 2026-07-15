"use server";

import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  if (novaSenha.length < 6) {
    return "A nova senha precisa ter pelo menos 6 caracteres.";
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

  const pixKeyRaw = formData.get("pixKey");
  const pixKey = typeof pixKeyRaw === "string" && pixKeyRaw.trim() ? pixKeyRaw.trim() : null;

  const dadosBancariosRaw = formData.get("dadosBancarios");
  const dadosBancarios =
    typeof dadosBancariosRaw === "string" && dadosBancariosRaw.trim()
      ? dadosBancariosRaw.trim()
      : null;

  await prisma.user.update({
    where: { email: session.user.email },
    data: { pixKey, dadosBancarios },
  });

  return "Dados de pagamento atualizados com sucesso.";
}
