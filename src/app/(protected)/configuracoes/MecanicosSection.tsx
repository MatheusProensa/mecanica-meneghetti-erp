import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import EmptyState from "@/components/ui/EmptyState";
import { createMecanico, deleteMecanico, toggleMecanicoAtivo } from "../mecanicos/actions";

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export default async function MecanicosSection() {
  const now = new Date();
  const inicioMes = startOfMonth(now);
  const fimMes = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const [mecanicos, osFinalizadasNoMes] = await Promise.all([
    prisma.mecanico.findMany({ orderBy: [{ ativo: "desc" }, { nome: "asc" }] }),
    prisma.ordemServico.findMany({
      where: {
        mecanicoId: { not: null },
        status: { in: ["concluida", "entregue"] },
        updatedAt: { gte: inicioMes, lt: fimMes },
      },
      include: { itens: true },
    }),
  ]);

  const statsPorMecanico = new Map<string, { quantidade: number; faturamento: number }>();
  for (const os of osFinalizadasNoMes) {
    if (!os.mecanicoId) continue;
    const atual = statsPorMecanico.get(os.mecanicoId) ?? { quantidade: 0, faturamento: 0 };
    atual.quantidade += 1;
    atual.faturamento += os.itens.reduce((s, i) => s + i.valor, 0);
    statsPorMecanico.set(os.mecanicoId, atual);
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
      <form action={createMecanico} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
            Novo mecânico
          </label>
          <input
            id="nome"
            name="nome"
            required
            placeholder="Nome"
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="min-h-11 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 sm:w-auto"
        >
          + Adicionar
        </button>
      </form>

      <div className="mt-5 border-t border-gray-100 pt-4">
        {mecanicos.length === 0 ? (
          <EmptyState
            icon="tools"
            title="Nenhum mecânico cadastrado"
            description="Adicione o primeiro mecânico para começar a vincular nas OS."
          />
        ) : (
          <div className="divide-y divide-gray-100">
            {mecanicos.map((mecanico) => {
              const stats = statsPorMecanico.get(mecanico.id) ?? {
                quantidade: 0,
                faturamento: 0,
              };
              const toggleWithId = toggleMecanicoAtivo.bind(null, mecanico.id, !mecanico.ativo);
              const deleteWithId = deleteMecanico.bind(null, mecanico.id);

              return (
                <div
                  key={mecanico.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p className="flex items-center gap-2 font-medium text-gray-900">
                      {mecanico.nome}
                      {!mecanico.ativo && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
                          Inativo
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {stats.quantidade} OS concluída{stats.quantidade === 1 ? "" : "s"} no mês ·{" "}
                      {formatCurrency(stats.faturamento)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <form action={toggleWithId}>
                      <button
                        type="submit"
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        {mecanico.ativo ? "Desativar" : "Ativar"}
                      </button>
                    </form>
                    <form action={deleteWithId}>
                      <button
                        type="submit"
                        className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        Excluir
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
