import webpush from "web-push";
import { prisma } from "@/lib/prisma";

let configurado = false;

function garantirConfigurado() {
  if (configurado) return;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:contato@oficina.local";
  if (!publicKey || !privateKey) {
    throw new Error("Notificações push não configuradas: defina VAPID_PRIVATE_KEY e NEXT_PUBLIC_VAPID_PUBLIC_KEY");
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configurado = true;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

/** Envia uma notificação para todos os dispositivos inscritos de um usuário
 * (ou de todos os usuários, se nenhum userId for informado). Remove do banco
 * as inscrições que o navegador já invalidou (410/404). */
export async function enviarPushParaTodos(payload: PushPayload): Promise<{ enviadas: number; removidas: number }> {
  garantirConfigurado();

  const inscricoes = await prisma.pushSubscription.findMany();
  let enviadas = 0;
  const idsParaRemover: string[] = [];

  await Promise.all(
    inscricoes.map(async (inscricao) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: inscricao.endpoint,
            keys: { p256dh: inscricao.p256dh, auth: inscricao.auth },
          },
          JSON.stringify(payload)
        );
        enviadas++;
      } catch (error) {
        const status = (error as { statusCode?: number }).statusCode;
        if (status === 404 || status === 410) {
          idsParaRemover.push(inscricao.id);
        } else {
          console.error("[push] falha ao enviar:", error);
        }
      }
    })
  );

  if (idsParaRemover.length > 0) {
    await prisma.pushSubscription.deleteMany({ where: { id: { in: idsParaRemover } } });
  }

  return { enviadas, removidas: idsParaRemover.length };
}
