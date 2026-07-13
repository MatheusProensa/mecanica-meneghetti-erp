"use client";

import { useState } from "react";
import { formatPhoneBR } from "@/lib/format";

export default function PhoneInput({
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
  const [value, setValue] = useState(formatPhoneBR(defaultValue));

  return (
    <input
      id={id}
      name={name}
      type="tel"
      inputMode="tel"
      required={required}
      placeholder="(99) 9 9999-9999"
      value={value}
      onChange={(e) => setValue(formatPhoneBR(e.target.value))}
      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
    />
  );
}
