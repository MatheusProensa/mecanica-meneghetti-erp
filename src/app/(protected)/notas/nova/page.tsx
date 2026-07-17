import { prisma } from "@/lib/prisma";
import NotaForm from "@/components/NotaForm";
import { createNota } from "../actions";

export default async function NovaNotaPage() {
  const [clientes, ordens] = await Promise.all([
    prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
    prisma.ordemServico.findMany({
      include: { cliente: true },
      orderBy: { id: "desc" },
      take: 100,
    }),
  ]);

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-gray-900">Nova nota</h1>
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
        <NotaForm
          clientes={clientes}
          ordens={ordens.map((os) => ({ id: os.id, clienteNome: os.cliente.nome }))}
          action={createNota}
        />
      </div>
    </div>
  );
}
