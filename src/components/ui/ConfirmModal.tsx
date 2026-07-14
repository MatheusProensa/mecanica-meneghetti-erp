"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

function ConfirmSubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
    >
      {pending ? "Excluindo..." : label}
    </button>
  );
}

export default function ConfirmModal({
  triggerLabel = "Excluir",
  title,
  description,
  action,
  confirmLabel = "Excluir",
}: {
  triggerLabel?: string;
  title: string;
  description: string;
  action: (formData: FormData) => void;
  confirmLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
      >
        {triggerLabel}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            <p className="mt-2 text-sm text-gray-600">{description}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <form action={action}>
                <ConfirmSubmitButton label={confirmLabel} />
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
