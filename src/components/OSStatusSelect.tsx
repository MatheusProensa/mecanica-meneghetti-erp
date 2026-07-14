"use client";

import { useTransition } from "react";
import { updateOSStatus } from "@/app/(protected)/os/actions";
import type { StatusOS } from "@/generated/prisma/client";
import { osStatusMap } from "@/components/ui/StatusBadge";

export default function OSStatusSelect({ id, status }: { id: number; status: StatusOS }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        const next = e.target.value as StatusOS;
        startTransition(() => {
          updateOSStatus(id, next);
        });
      }}
      className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 disabled:opacity-60"
    >
      {Object.entries(osStatusMap).map(([value, { label }]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
