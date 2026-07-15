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

// deriva o fundo do chip de ícone a partir da cor de texto já passada, sem exigir uma prop nova
const iconBgByColor: Record<string, string> = {
  "text-green-600": "bg-green-50",
  "text-red-600": "bg-red-50",
  "text-amber-600": "bg-amber-50",
  "text-blue-600": "bg-blue-50",
  "text-gray-500": "bg-gray-100",
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
  const iconBg = iconBgByColor[iconColor] ?? "bg-gray-100";

  return (
    <div
      className={`min-h-[110px] rounded-xl border border-gray-200 bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04)] transition-shadow hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] ${
        highlight ? highlightBorder[highlight] : ""
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </span>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {label}
        </p>
      </div>
      <p className="mt-3.5 text-[26px] font-bold leading-tight tracking-tight text-gray-900">
        {value}
      </p>
      {context && <p className="mt-1 text-xs text-gray-500">{context}</p>}
    </div>
  );
}
