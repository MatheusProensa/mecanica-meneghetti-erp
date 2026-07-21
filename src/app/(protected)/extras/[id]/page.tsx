import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { calcularStatusExtra } from "@/lib/extras";
import { formatCurrency, formatDate } from "@/lib/format";
import ExtraForm from "@/components/ExtraForm";
import CurrencyInput from "@/components/CurrencyInput";
import MetricCard from "@/components/ui/MetricCard";
import ValorOculto from "@/components/ui/ValorOculto";
import SectionHeader from "@/components/ui/SectionHeader";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { StatusBadge, statusExtraMap } from "@/components/ui/StatusBadge";
import { updateExtra, deleteExtra, addPagamentoExtra, deletePagamentoExtra } from "../actions";

export default async function ExtraDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");
  if (!usuario.permissoes.verExtras) redirect("/");

  const [extra, mecanicos, clientes, ordens] = await Promise.all([
    prisma.extraFuncionario.findUnique({
      where: { id },
      include: {
        mecanico: true,
        cliente: true,
        ordemServico: { include: { cliente: true } },
        pagamentos: { orderBy: { data: "desc" } },
      },
    }),
    prisma.mecanico.findMany({ orderBy: { nome: "asc" } }),
    prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
    prisma.ordemServico.findMany({
      include: { cliente: true },
      orderBy: { id: "desc" },
      take: 100,
    }),
  ]);

  if (!extra) notFound();

  const { totalPago, saldo, status, lucroEmpresa } = calcularStatusExtra(
    extra.valorServico,
    extra.valorExtra,
    extra.outrosCustos,
    extra.pagamentos
  );

  const ordensParaSelect =
    extra.ordemServico && !ordens.some((os) => os.id === extra.ordemServico!.id)
      ? [extra.ordemServico, ...ordens]
      : ordens;

  const updateExtraWithId = updateExtra.bind(null, extra.id);
  const deleteExtraWithId = deleteExtra.bind(null, extra.id);
  const addPagamentoWithId = addPagamentoExtra.bind(null, extra.id);

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/extras" className="text-sm text-gray-500 hover:underline">
            ← Extras
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-gray-900">{extra.mecanico.nome}</h1>
          <p className="text-sm text-gray-500">
            {extra.cliente?.nome ?? ""}
            {extra.cliente && extra.ordemServico ? " · " : ""}
            {extra.ordemServico ? `OS #${String(extra.ordemServico.id).padStart(4, "0")}` : ""}
          </p>
          <div className="mt-2">
            <StatusBadge {...statusExtraMap[status]} />
          </div>
        </div>
        {usuario.permissoes.excluirExtras && (
          <ConfirmModal
            triggerLabel="Excluir extra"
            title="Excluir este extra?"
            description={`Tem certeza que deseja excluir o extra de "${extra.mecanico.nome}"? Todos os pagamentos registrados também serão apagados. Essa ação não pode ser desfeita.`}
            action={deleteExtraWithId}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          icon="hand-coins"
          iconColor="text-blue-600"
          label="Valor do extra"
          value={<ValorOculto>{formatCurrency(extra.valorExtra)}</ValorOculto>}
        />
        <MetricCard
          icon="trending-up"
          iconColor="text-green-600"
          label="Já pago"
          value={<ValorOculto>{formatCurrency(totalPago)}</ValorOculto>}
        />
        <MetricCard
          icon="clock"
          iconColor="text-amber-600"
          label="Saldo restante"
          value={<ValorOculto>{formatCurrency(saldo)}</ValorOculto>}
        />
        <MetricCard
          icon="wallet"
          iconColor={lucroEmpresa >= 0 ? "text-green-600" : "text-red-600"}
          label="Lucro da empresa"
          value={<ValorOculto>{formatCurrency(lucroEmpresa)}</ValorOculto>}
          context="Serviço − extra − outros custos"
          highlight={lucroEmpresa >= 0 ? "success" : "danger"}
          className="col-span-2 lg:col-span-1"
        />
      </div>

      <div>
        <SectionHeader icon="hand-coins" iconColor="text-blue-600" title="Dados do lançamento" />
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
          <ExtraForm
            extra={extra}
            mecanicos={mecanicos}
            clientes={clientes}
            ordens={ordensParaSelect.map((os) => ({ id: os.id, clienteNome: os.cliente.nome }))}
            action={updateExtraWithId}
            readOnly={!usuario.permissoes.editarExtras}
          />
        </div>
      </div>

      <div>
        <SectionHeader icon="trending-up" iconColor="text-green-600" title="Pagamentos" />

        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
          {extra.pagamentos.length === 0 ? (
            <EmptyState
              icon="clock"
              title="Nenhum pagamento registrado"
              description="Registre os pagamentos do extra conforme forem sendo feitos ao funcionário."
            />
          ) : (
            <div className="divide-y divide-gray-100">
              {extra.pagamentos.map((p) => (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6">
                  <div>
                    <p className="font-medium text-gray-900">{formatCurrency(p.valor)}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(p.data)}
                      {p.formaPagamento ? ` · ${p.formaPagamento}` : ""}
                    </p>
                  </div>
                  {usuario.permissoes.excluirExtras && (
                    <form action={deletePagamentoExtra.bind(null, p.id, extra.id)}>
                      <button
                        type="submit"
                        className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        Excluir
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {usuario.permissoes.editarExtras && saldo > 0 && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
            <h3 className="text-sm font-semibold text-gray-900">Registrar pagamento</h3>
            <form action={addPagamentoWithId} className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="data" className="block text-sm font-medium text-gray-700">
                  Data *
                </label>
                <input
                  id="data"
                  name="data"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="valor" className="block text-sm font-medium text-gray-700">
                  Valor *
                </label>
                <CurrencyInput
                  id="valor"
                  name="valor"
                  required
                  className="mt-1 w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="formaPagamento" className="block text-sm font-medium text-gray-700">
                  Forma de pagamento
                </label>
                <input
                  id="formaPagamento"
                  name="formaPagamento"
                  placeholder="Pix, dinheiro, cartão..."
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 sm:w-auto"
                >
                  Registrar pagamento
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
