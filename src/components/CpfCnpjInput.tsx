"use client";

import { useState } from "react";
import { formatCpfCnpj } from "@/lib/format";

export default function CpfCnpjInput({
  id,
  name,
  defaultValue,
  required,
}: {
  id: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
}) {
  const [value, setValue] = useState(formatCpfCnpj(defaultValue));

  return (
    <input
      id={id}
      name={name}
      type="text"
      inputMode="numeric"
      required={required}
      placeholder="000.000.000-00"
      value={value}
      onChange={(e) => setValue(formatCpfCnpj(e.target.value))}
      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  );
}
