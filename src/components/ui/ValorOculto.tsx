"use client";

import { useValoresVisibilidade } from "@/components/ValoresVisibilidadeContext";

export default function ValorOculto({ children }: { children: React.ReactNode }) {
  const { oculto } = useValoresVisibilidade();
  return <>{oculto ? "R$ ••••••" : children}</>;
}
