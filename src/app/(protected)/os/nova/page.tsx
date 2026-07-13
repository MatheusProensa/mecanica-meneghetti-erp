import { prisma } from "@/lib/prisma";
import OSForm from "@/components/OSForm";
import { createOS } from "../actions";

export default async function NovaOSPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string }>;
}) {
  const { clienteId } = await searchParams;
  const clientes = await prisma.cliente.findMany({ orderBy: { nome: "asc" } });

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900">
        Nova ordem de serviço
      </h1>
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6">
        <OSForm clientes={clientes} defaultClienteId={clienteId} action={createOS} />
      </div>
    </div>
  );
}
