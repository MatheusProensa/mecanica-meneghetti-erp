import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { createMecanico, deleteMecanico, toggleMecanicoAtivo } from "./actions";

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export default async function MecanicosPage() {
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
    <div className="max-w-2xl space-y-8">
      <PageHeader
        title="Mecânicos"
        description="Cadastre os mecânicos da oficina para vincular às OS e acompanhar o serviço de cada um."
      />

      <div>
        <h2 className="text-sm font-semibold text-gray-900">Novo mecânico</h2>
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
          <form action={createMecanico} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                Nome
              </label>
              <input
                id="nome"
                name="nome"
                required
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="min-h-11 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 sm:w-auto"
            >
              + Adicionar
            </button>
          </form>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-900">
          Serviços concluídos no mês
        </h2>
        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-white">
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
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6"
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
                        {stats.quantidade} OS concluída{stats.quantidade === 1 ? "" : "s"} ·{" "}
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
    </div>
  );
}
