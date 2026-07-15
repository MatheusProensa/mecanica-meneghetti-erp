"use client";

import { useTransition } from "react";
import { updateOSStatus } from "@/app/(protected)/os/actions";
import type { StatusOS } from "@/generated/prisma/client";
import { osStatusMap, type BadgeTone } from "@/components/ui/StatusBadge";

const selectToneClasses: Record<BadgeTone, string> = {
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  amber: "bg-amber-50 border-amber-200 text-amber-800",
  green: "bg-green-50 border-green-200 text-green-800",
  gray: "bg-gray-100 border-gray-200 text-gray-700",
  red: "bg-red-50 border-red-200 text-red-700",
  orange: "bg-orange-50 border-orange-200 text-orange-800",
  purple: "bg-purple-50 border-purple-200 text-purple-800",
};

export default function OSStatusSelect({
  id,
  status,
  compact = false,
}: {
  id: number;
  status: StatusOS;
  compact?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const tone = osStatusMap[status].tone;

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
      className={`select-compact rounded-lg border font-semibold shadow-sm disabled:opacity-60 ${selectToneClasses[tone]} ${
        compact ? "h-7 max-w-[132px] px-2 text-[11px]" : "h-8 px-3 text-xs"
      }`}
    >
      {Object.entries(osStatusMap).map(([value, { label }]) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}
