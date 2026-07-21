"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface ValoresVisibilidadeContextValue {
  oculto: boolean;
  alternar: () => void;
}

const ValoresVisibilidadeContext = createContext<ValoresVisibilidadeContextValue | null>(null);

const STORAGE_KEY = "valoresOcultos";

export function ValoresVisibilidadeProvider({ children }: { children: React.ReactNode }) {
  const [oculto, setOculto] = useState(false);

  useEffect(() => {
    // Lê do localStorage só depois de montar, pra não divergir do HTML
    // renderizado no servidor (que não tem acesso a ele).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOculto(window.localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  function alternar() {
    setOculto((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <ValoresVisibilidadeContext.Provider value={{ oculto, alternar }}>
      {children}
    </ValoresVisibilidadeContext.Provider>
  );
}

export function useValoresVisibilidade(): ValoresVisibilidadeContextValue {
  const ctx = useContext(ValoresVisibilidadeContext);
  if (!ctx) {
    throw new Error("useValoresVisibilidade precisa estar dentro de ValoresVisibilidadeProvider");
  }
  return ctx;
}
