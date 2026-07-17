"use server";

import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function resetPassword(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const token = formData.get("token");
  const novaSenha = formData.get("novaSenha");
  const confirmarSenha = formData.get("confirmarSenha");

  if (typeof token !== "string" || !token) return "Link inválido ou expirado.";
  if (typeof novaSenha !== "string" || typeof confirmarSenha !== "string" || !novaSenha) {
    return "Preencha a nova senha.";
  }
  if (novaSenha.length < 8) return "A nova senha precisa ter pelo menos 8 caracteres.";
  if (novaSenha !== confirmarSenha) return "A confirmação não bate com a nova senha.";

  const tokenHash = hashToken(token);
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return "Link inválido ou expirado. Peça um novo link de redefinição.";
  }

  const passwordHash = await bcrypt.hash(novaSenha, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
  ]);

  return "sucesso";
}
