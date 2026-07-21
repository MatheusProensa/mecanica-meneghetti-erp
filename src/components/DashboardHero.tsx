"use client";

import { useEffect, useState } from "react";
import DarkPatternBg from "@/components/ui/DarkPatternBg";

const FUSO = "America/Sao_Paulo";

function horaEmBrasilia(agora: Date): number {
  return Number(
    new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, hourCycle: "h23", hour: "2-digit" }).format(
      agora
    )
  );
}

function saudacao(hora: number) {
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

export default function DashboardHero({ nome, agora }: { nome: string; agora: Date }) {
  const [now, setNow] = useState(agora);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1_000);
    return () => clearInterval(id);
  }, []);

  const primeiroNome = nome.split(" ")[0];
  const dataFormatada = now.toLocaleDateString("pt-BR", {
    timeZone: FUSO,
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  const horaFormatada = now.toLocaleTimeString("pt-BR", {
    timeZone: FUSO,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-900 to-gray-800 shadow-sm">
      <DarkPatternBg />

      <div className="relative px-5 py-6 sm:px-6">
        <p className="text-sm text-gray-400">
          {saudacao(horaEmBrasilia(now))}, {primeiroNome}!
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">Dashboard</h1>
        <p className="mt-1 text-sm capitalize text-gray-300">{dataFormatada}</p>
        <p className="mt-0.5 text-sm tabular-nums text-gray-400">{horaFormatada}</p>
      </div>
    </div>
  );
}
