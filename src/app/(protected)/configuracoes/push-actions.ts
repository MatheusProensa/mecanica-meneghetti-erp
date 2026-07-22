"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/requireAuth";

export async function salvarPushSubscription(subscription: {
  endpoint: string;
  keys: { p256dh: string; auth: string };
}) {
  const session = await requireAuth();
  if (!session.user?.email) throw new Error("Sessão inválida.");

  const user = await prisma.user.findUniqueOrThrow({ where: { email: session.user.email } });

  await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    update: { userId: user.id, p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
    create: {
      userId: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  });
}

export async function removerPushSubscription(endpoint: string) {
  await requireAuth();
  await prisma.pushSubscription.deleteMany({ where: { endpoint } });
}
