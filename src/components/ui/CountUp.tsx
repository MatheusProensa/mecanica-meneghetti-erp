"use client";

import { useEffect, useState } from "react";

const DURACAO_MS = 700;

export default function CountUp({
  value,
  format,
}: {
  value: number;
  format: (n: number) => string;
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

  return <>{format(display)}</>;
}
