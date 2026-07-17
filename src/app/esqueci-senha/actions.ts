"use server";

import { randomBytes, createHash } from "node:crypto";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

const TOKEN_VALIDO_MINUTOS = 60;
const MENSAGEM_GENERICA =
  "Se esse e-mail estiver cadastrado, você vai receber um link para redefinir a senha em instantes.";

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordReset(
  _prevState: string | undefined,
  formData: FormData
): Promise<string | undefined> {
  const emailRaw = formData.get("email");
  const email = typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : "";
  if (!email) return "Informe um e-mail.";

  const user = await prisma.user.findUnique({ where: { email } });

  // Sempre responde com a mesma mensagem, exista ou não o e-mail, pra não revelar
  // quais e-mails estão cadastrados no sistema.
  if (!user) return MENSAGEM_GENERICA;

  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + TOKEN_VALIDO_MINUTOS * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = headerList.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  const resetUrl = `${protocol}://${host}/redefinir-senha?token=${token}`;

  try {
    await sendPasswordResetEmail(user.email, resetUrl);
  } catch (error) {
    console.error("[esqueci-senha] falha ao enviar e-mail:", error);
  }

  return MENSAGEM_GENERICA;
}
