"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/format";

const DURACAO_MS = 700;

export default function CountUp({
  value,
  kind = "integer",
}: {
  value: number;
  kind?: "currency" | "integer";
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let raf: number;
    let inicio: number | null = null;

    function tick(ts: number) {
      if (inicio === null) inicio = ts;
      const progresso = Math.min((ts - inicio) / DURACAO_MS, 1);
      const suavizado = 1 - Math.pow(1 - progresso, 3);
      setDisplay(value * suavizado);
      if (progresso < 1) raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return <>{kind === "currency" ? formatCurrency(display) : String(Math.round(display))}</>;
}
