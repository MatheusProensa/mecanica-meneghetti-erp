"use client";

import { iconMap, type IconName } from "./icon-map";

export interface EmptyStateProps {
  icon: IconName;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  const Icon = iconMap[icon];

  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
        <Icon className="h-5 w-5 text-gray-500" />
      </div>
      <p className="text-sm font-medium text-gray-700">{title}</p>
      <p className="max-w-sm text-sm text-gray-600">{description}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-2 rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
