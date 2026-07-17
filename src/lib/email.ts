import { Resend } from "resend";

const FROM = process.env.RESEND_FROM_EMAIL ?? "Mecânica Meneghetti <onboarding@resend.dev>";

/**
 * Envia o e-mail de redefinição de senha via Resend. Se RESEND_API_KEY não estiver
 * configurada, não envia nada (apenas loga no servidor) — o fluxo de reset continua
 * funcionando via link direto, só não chega e-mail até a chave ser configurada.
 */
export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(
      `[email] RESEND_API_KEY não configurada — e-mail de redefinição de senha não enviado para ${to}. Link: ${resetUrl}`
    );
    return;
  }

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: FROM,
    to,
    subject: "Redefinir senha — Mecânica Meneghetti",
    html: `
      <p>Foi solicitada a redefinição da sua senha no sistema da Mecânica Meneghetti.</p>
      <p><a href="${resetUrl}">Clique aqui para definir uma nova senha</a></p>
      <p>Esse link expira em 1 hora. Se você não pediu essa redefinição, pode ignorar este e-mail.</p>
    `,
  });
}
