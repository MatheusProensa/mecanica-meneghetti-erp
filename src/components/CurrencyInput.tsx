"use client";

import { useState } from "react";
import { formatCurrencyBR, formatNumberToCurrencyInput } from "@/lib/format";

export default function CurrencyInput({
  id,
  name,
  value,
  defaultValue,
  onChange,
  required,
  placeholder = "0,00",
  className,
}: {
  id?: string;
  name?: string;
  /** Modo controlado: parent guarda a string já formatada. */
  value?: string;
  /** Modo não controlado: valor numérico vindo do banco. */
  defaultValue?: number | null;
  onChange?: (formatted: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
}) {
  const [internal, setInternal] = useState(() => formatNumberToCurrencyInput(defaultValue));

  const isControlled = value !== undefined;
  const current = isControlled ? value : internal;

  function handleChange(raw: string) {
    const formatted = formatCurrencyBR(raw);
    if (!isControlled) setInternal(formatted);
    onChange?.(formatted);
  }

  function handleBlur() {
    if (!current || current.includes(",")) return;
    const completo = `${current},00`;
    if (!isControlled) setInternal(completo);
    onChange?.(completo);
  }

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
        R$
      </span>
      <input
        id={id}
        name={name}
        type="text"
        inputMode="decimal"
        required={required}
        placeholder={placeholder}
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={handleBlur}
        className={
          className ??
          "w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        }
      />
    </div>
  );
}
