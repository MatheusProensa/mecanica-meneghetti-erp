import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { calcularSituacaoDivida } from "@/lib/dividas";
import { formatCurrency, formatDate } from "@/lib/format";
import { getSignedDividaFotoUrls } from "@/lib/supabase-storage";
import DividaForm from "@/components/DividaForm";
import DividaFotos from "@/components/DividaFotos";
import CurrencyInput from "@/components/CurrencyInput";
import MetricCard from "@/components/ui/MetricCard";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { StatusBadge, situacaoDividaMap } from "@/components/ui/StatusBadge";
import { updateDivida, deleteDivida, addPagamento, deletePagamento } from "../actions";

export default async function DividaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");
  if (!usuario.permissoes.verFinanceiro) redirect("/");

  const [divida, clientes] = await Promise.all([
    prisma.divida.findUnique({
      where: { id },
      include: {
        cliente: true,
        itens: { orderBy: { data: "desc" } },
        pagamentos: { orderBy: { data: "desc" } },
        anexos: { orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
  ]);

  if (!divida) notFound();

  const urlsPorPath = await getSignedDividaFotoUrls(divida.anexos.map((a) => a.path));
  const fotos = divida.anexos.map((a) => ({ id: a.id, url: urlsPorPath[a.path] ?? null }));

  const { valorOriginal, totalPago, saldo, situacao } = calcularSituacaoDivida(
    divida.itens,
    divida.pagamentos
  );

  const updateDividaWithId = updateDivida.bind(null, divida.id);
  const deleteDividaWithId = deleteDivida.bind(null, divida.id);
  const addPagamentoWithId = addPagamento.bind(null, divida.id);

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/devedores" className="text-sm text-gray-500 hover:underline">
            ← Devedores
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-gray-900">
            <Link href={`/clientes/${divida.clienteId}`} className="hover:underline">
              {divida.cliente.nome}
            </Link>
          </h1>
          <div className="mt-2">
            <StatusBadge {...situacaoDividaMap[situacao]} />
          </div>
        </div>
        {usuario.permissoes.excluir && (
          <ConfirmModal
            triggerLabel="Excluir dívida"
            title="Excluir esta dívida?"
            description={`Tem certeza que deseja excluir a dívida de "${divida.cliente.nome}"? Todos os pagamentos registrados também serão apagados. Essa ação não pode ser desfeita.`}
            action={deleteDividaWithId}
          />
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          icon="alert-triangle"
          iconColor="text-red-600"
          label="Valor original"
          value={formatCurrency(valorOriginal)}
        />
        <MetricCard
          icon="trending-up"
          iconColor="text-green-600"
          label="Já pago"
          value={formatCurrency(totalPago)}
        />
        <MetricCard
          icon="clock"
          iconColor="text-amber-600"
          label="Saldo restante"
          value={formatCurrency(saldo)}
        />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-900">Dados da dívida</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
          <DividaForm
            divida={divida}
            clientes={clientes}
            action={updateDividaWithId}
            readOnly={!usuario.permissoes.editar}
          />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
        <DividaFotos dividaId={divida.id} fotos={fotos} readOnly={!usuario.permissoes.editar} />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-900">Pagamentos</h2>

        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
          {divida.pagamentos.length === 0 ? (
            <EmptyState
              icon="clock"
              title="Nenhum pagamento registrado"
              description="Registre os pagamentos parciais conforme o cliente for quitando a dívida."
            />
          ) : (
            <div className="divide-y divide-gray-100">
              {divida.pagamentos.map((p) => (
                <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-6">
                  <div>
                    <p className="font-medium text-gray-900">{formatCurrency(p.valor)}</p>
                    <p className="text-sm text-gray-500">
                      {formatDate(p.data)}
                      {p.formaPagamento ? ` · ${p.formaPagamento}` : ""}
                    </p>
                    {p.observacao && <p className="mt-0.5 text-sm text-gray-500">{p.observacao}</p>}
                  </div>
                  {usuario.permissoes.excluir && (
                    <form action={deletePagamento.bind(null, p.id, divida.id)}>
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

        {usuario.permissoes.editar && saldo > 0 && (
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
              <div>
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
              <div>
                <label htmlFor="observacao" className="block text-sm font-medium text-gray-700">
                  Observação
                </label>
                <input
                  id="observacao"
                  name="observacao"
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
