"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import { salvarPushSubscription, removerPushSubscription } from "@/app/(protected)/configuracoes/push-actions";

type Estado = "verificando" | "nao-suportado" | "inativo" | "ativo";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

export default function PushNotificationToggle() {
  const [estado, setEstado] = useState<Estado>("verificando");
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    async function verificar() {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setEstado("nao-suportado");
        return;
      }
      const registration = await navigator.serviceWorker.register("/sw.js");
      const subscription = await registration.pushManager.getSubscription();
      setEstado(subscription ? "ativo" : "inativo");
    }
    verificar().catch(() => setEstado("nao-suportado"));
  }, []);

  function ativar() {
    setErro(null);
    startTransition(async () => {
      try {
        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (!publicKey) throw new Error("Recurso não configurado no servidor.");

        const permissao = await Notification.requestPermission();
        if (permissao !== "granted") {
          setErro("Permissão de notificação negada pelo navegador.");
          return;
        }

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });

        await salvarPushSubscription(subscription.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } });
        setEstado("ativo");
      } catch {
        setErro("Não foi possível ativar as notificações. Tente novamente.");
      }
    });
  }

  function desativar() {
    setErro(null);
    startTransition(async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await removerPushSubscription(subscription.endpoint);
          await subscription.unsubscribe();
        }
        setEstado("inativo");
      } catch {
        setErro("Não foi possível desativar. Tente novamente.");
      }
    });
  }

  if (estado === "verificando") return null;

  if (estado === "nao-suportado") {
    return (
      <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4 text-sm text-gray-500">
        <BellOff className="mt-0.5 h-4 w-4 shrink-0" />
        <p>Este navegador não é compatível com notificações push.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 p-4">
      <div className="flex items-start gap-3">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${estado === "ativo" ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-500"}`}>
          {estado === "ativo" ? <BellRing className="h-4.5 w-4.5" /> : <Bell className="h-4.5 w-4.5" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-gray-900">Notificações neste dispositivo</p>
          <p className="mt-0.5 text-sm text-gray-500">
            {estado === "ativo"
              ? "Ativadas — você recebe um resumo diário de OS atrasadas e dívidas em aberto."
              : "Receba um aviso no celular quando houver OS atrasada ou dívida em aberto."}
          </p>
          {erro && <p className="mt-1.5 text-sm text-red-600">{erro}</p>}
          <button
            type="button"
            onClick={estado === "ativo" ? desativar : ativar}
            disabled={pending}
            className={`mt-3 rounded-lg px-3.5 py-2 text-sm font-medium disabled:opacity-60 ${
              estado === "ativo"
                ? "border border-gray-300 text-gray-700 hover:bg-gray-50"
                : "bg-brand-600 text-white hover:bg-brand-700"
            }`}
          >
            {pending ? "Aguarde..." : estado === "ativo" ? "Desativar" : "Ativar notificações"}
          </button>
        </div>
      </div>
    </div>
  );
}
