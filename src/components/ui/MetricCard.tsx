import { iconMap, type IconName } from "./icon-map";

export interface MetricCardProps {
  label: string;
  value: string | number;
  icon: IconName;
  iconColor: string;
  context?: string;
  highlight?: "danger" | "warning" | "success";
}

const highlightBorder: Record<NonNullable<MetricCardProps["highlight"]>, string> = {
  danger: "border-l-4 border-l-red-600",
  warning: "border-l-4 border-l-amber-600",
  success: "border-l-4 border-l-green-600",
};

export default function MetricCard({
  label,
  value,
  icon,
  iconColor,
  context,
  highlight,
}: MetricCardProps) {
  const Icon = iconMap[icon];

  return (
    <div
      className={`min-h-[110px] rounded-[10px] border border-gray-200 bg-white p-5 transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] ${
        highlight ? highlightBorder[highlight] : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className={`h-5 w-5 shrink-0 ${iconColor}`} />
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
          {label}
        </p>
      </div>
      <p className="mt-2 text-[28px] font-bold leading-tight text-gray-900">
        {value}
      </p>
      {context && <p className="mt-1 text-xs text-gray-500">{context}</p>}
    </div>
  );
}
