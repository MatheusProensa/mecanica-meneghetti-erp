import { X } from "lucide-react";
import SectionHeader from "@/components/ui/SectionHeader";
import { addAnexoOS, deleteAnexoOS } from "@/app/(protected)/os/actions";

export default function OSFotos({
  osId,
  fotos,
  readOnly = false,
}: {
  osId: number;
  fotos: { id: string; url: string | null }[];
  readOnly?: boolean;
}) {
  const addAnexoWithId = addAnexoOS.bind(null, osId);

  return (
    <div>
      <SectionHeader icon="camera" iconColor="text-gray-600" title="Fotos" />

      {fotos.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {fotos.map((foto) => {
            const deleteWithId = deleteAnexoOS.bind(null, foto.id, osId);
            return (
              <div key={foto.id} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                {foto.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={foto.url} alt="Foto da OS" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                    Indisponível
                  </div>
                )}
                {!readOnly && (
                  <form action={deleteWithId} className="absolute right-1 top-1">
                    <button
                      type="submit"
                      title="Excluir foto"
                      className="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!readOnly && (
        <form action={addAnexoWithId} className="mt-3 flex flex-wrap items-center gap-3">
          <input
            type="file"
            name="foto"
            accept="image/*"
            required
            className="text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-gray-200"
          />
          <button
            type="submit"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            + Adicionar foto
          </button>
        </form>
      )}
    </div>
  );
}
