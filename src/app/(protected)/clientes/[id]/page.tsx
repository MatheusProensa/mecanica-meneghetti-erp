import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { getEmpresa } from "@/lib/getEmpresa";
import { formatCurrency, formatDate, formatPhoneBR } from "@/lib/format";
import { calcularSituacaoDivida, dataMaisAntigaItem } from "@/lib/dividas";
import ClienteForm from "@/components/ClienteForm";
import CobrancaCliente from "@/components/CobrancaCliente";
import MetricCard from "@/components/ui/MetricCard";
import ValorOculto from "@/components/ui/ValorOculto";
import CountUp from "@/components/ui/CountUp";
import SectionHeader from "@/components/ui/SectionHeader";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { StatusBadge, osStatusMap, notaTipoMap, situacaoDividaMap } from "@/components/ui/StatusBadge";
import WhatsAppLink from "@/components/ui/WhatsAppLink";
import { updateCliente, deleteCliente } from "../actions";

export default async function ClienteDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const usuarioAtual = await getCurrentUser();
  if (!usuarioAtual) redirect("/login");
  if (!usuarioAtual.permissoes.verClientes) redirect("/");

  const [cliente, session, empresa] = await Promise.all([
    prisma.cliente.findUnique({
      where: { id },
      include: {
        ordensServico: {
          include: { itens: true },
          orderBy: { data: "desc" },
        },
        notas: {
          orderBy: { dataEmissao: "desc" },
        },
        dividas: {
          include: { pagamentos: true, itens: true },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    auth(),
    getEmpresa(),
  ]);

  if (!cliente) notFound();

  const usuario = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { pixKey: true, dadosBancarios: true },
      })
    : null;

  const valorTotalGasto = cliente.ordensServico.reduce(
    (sum, os) => sum + os.itens.reduce((s, item) => s + item.valor, 0),
    0
  );
  const quantidadeServicos = cliente.ordensServico.length;
  const ultimaVisita = cliente.ordensServico[0]?.data ?? null;

  const ordensAbertas = cliente.ordensServico
    .filter((os) => !os.pago && os.status !== "cancelada")
    .map((os) => ({
      id: os.id,
      data: os.data,
      descricao: os.itens.map((i) => i.descricao).join(", "),
      valor: os.itens.reduce((s, i) => s + i.valor, 0),
    }));

  const updateClienteWithId = updateCliente.bind(null, cliente.id);
  const deleteClienteWithId = deleteCliente.bind(null, cliente.id);

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/clientes" className="text-sm text-gray-500 hover:underline">
            ← Clientes
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-gray-900">{cliente.nome}</h1>
          {(cliente.telefone || cliente.whatsapp) && (
            <WhatsAppLink phone={cliente.telefone ?? cliente.whatsapp} className="mt-1" />
          )}
        </div>
        {usuarioAtual.permissoes.excluirClientes && (
          <ConfirmModal
            triggerLabel="Excluir cliente"
            title="Excluir este cliente?"
            description={`Tem certeza que deseja excluir "${cliente.nome}"? Essa ação não pode ser desfeita.`}
            action={deleteClienteWithId}
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <MetricCard
          icon="wallet"
          iconColor="text-brand-600"
          label="Total gasto"
          value={<ValorOculto><CountUp value={valorTotalGasto} format={formatCurrency} /></ValorOculto>}
        />
        <MetricCard
          icon="tools"
          iconColor="text-brand-600"
          label="Serviços realizados"
          value={quantidadeServicos}
        />
        <MetricCard
          icon="calendar"
          iconColor="text-amber-600"
          label="Última visita"
          value={formatDate(ultimaVisita)}
          className="col-span-2 lg:col-span-1"
        />
      </div>

      <div>
        <SectionHeader icon="users" iconColor="text-brand-600" title="Dados cadastrais" />
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-[var(--shadow-card)]">
          <ClienteForm
            cliente={cliente}
            action={updateClienteWithId}
            readOnly={!usuarioAtual.permissoes.editarClientes}
          />
        </div>
      </div>

      {ordensAbertas.length > 0 && (
        <div>
          <CobrancaCliente
            empresa={empresa}
            cliente={{
              nome: cliente.nome,
              telefone: formatPhoneBR(cliente.telefone ?? cliente.whatsapp) || null,
              endereco: cliente.endereco,
              cpfCnpj: cliente.cpfCnpj,
            }}
            ordensAbertas={ordensAbertas}
            pixKeyPadrao={usuario?.pixKey ?? null}
            dadosBancariosPadrao={usuario?.dadosBancarios ?? null}
          />
        </div>
      )}

      <div>
        <SectionHeader
          icon="tools"
          iconColor="text-brand-600"
          title="Histórico de ordens de serviço"
          action={
            usuarioAtual.permissoes.editarClientes
              ? { label: "+ Nova OS", href: `/os/nova?clienteId=${cliente.id}` }
              : undefined
          }
        />

        <div className="mt-4 overflow-hidden rounded-[10px] border border-gray-200 bg-white shadow-[var(--shadow-card)]">
          {cliente.ordensServico.length === 0 ? (
            <EmptyState
              icon="tools"
              title="Nenhuma ordem de serviço ainda"
              description="Quando este cliente tiver uma OS, ela aparece aqui."
            />
          ) : (
            <>
              <table className="hidden w-full text-left text-sm md:table">
                <thead className="bg-gray-50/80 text-gray-500">
                  <tr>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">OS</th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {cliente.ordensServico.map((os) => (
                    <tr key={os.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <Link
                          href={`/os/${os.id}`}
                          className="font-medium text-gray-900 hover:underline"
                        >
                          #{String(os.id).padStart(4, "0")}
                        </Link>
                      </td>
                      <td className="px-6 py-3 text-gray-500">{formatDate(os.data)}</td>
                      <td className="px-6 py-3">
                        <StatusBadge {...osStatusMap[os.status]} />
                      </td>
                      <td className="px-6 py-3 text-gray-500">
                        {formatCurrency(os.itens.reduce((s, i) => s + i.valor, 0))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="divide-y divide-gray-100 md:hidden">
                {cliente.ordensServico.map((os) => (
                  <Link
                    key={os.id}
                    href={`/os/${os.id}`}
                    className="flex items-center justify-between gap-2 px-4 py-3 active:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        #{String(os.id).padStart(4, "0")}
                      </p>
                      <p className="text-sm text-gray-500">{formatDate(os.data)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge {...osStatusMap[os.status]} />
                      <span className="text-sm text-gray-600">
                        {formatCurrency(os.itens.reduce((s, i) => s + i.valor, 0))}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {usuarioAtual.permissoes.verDevedores && (
        <div>
          <SectionHeader
            icon="user-x"
            iconColor="text-red-600"
            title="Dívidas antigas"
            action={
              usuarioAtual.permissoes.editarDevedores
                ? { label: "+ Nova dívida", href: `/devedores/novo?clienteId=${cliente.id}` }
                : undefined
            }
          />

          <div className="mt-4 overflow-hidden rounded-[10px] border border-gray-200 bg-white shadow-[var(--shadow-card)]">
            {cliente.dividas.length === 0 ? (
              <EmptyState
                icon="user-x"
                title="Nenhuma dívida registrada"
                description="Serviços antigos em aberto deste cliente aparecem aqui."
              />
            ) : (
              <div className="divide-y divide-gray-100">
                {cliente.dividas.map((divida) => {
                  const { valorOriginal, saldo, situacao } = calcularSituacaoDivida(
                    divida.itens,
                    divida.pagamentos
                  );
                  const dataServico = dataMaisAntigaItem(divida.itens);
                  return (
                    <Link
                      key={divida.id}
                      href={`/devedores/${divida.id}`}
                      className="flex items-center justify-between gap-2 px-4 py-3 hover:bg-gray-50 sm:px-6"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(valorOriginal)}
                        </p>
                        {dataServico && (
                          <p className="text-sm text-gray-500">{formatDate(dataServico)}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge {...situacaoDividaMap[situacao]} />
                        <span className="text-sm text-gray-600">
                          Saldo: {formatCurrency(saldo)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        <SectionHeader
          icon="file-text"
          iconColor="text-gray-600"
          title="Notas vinculadas"
          action={
            usuarioAtual.permissoes.editarClientes
              ? { label: "+ Nova nota", href: "/notas/nova" }
              : undefined
          }
        />

        <div className="mt-4 overflow-hidden rounded-[10px] border border-gray-200 bg-white shadow-[var(--shadow-card)]">
          {cliente.notas.length === 0 ? (
            <EmptyState
              icon="file-text"
              title="Nenhuma nota vinculada"
              description="Notas emitidas ou recebidas para este cliente aparecem aqui."
            />
          ) : (
            <div className="divide-y divide-gray-100">
              {cliente.notas.map((nota) => (
                <Link
                  key={nota.id}
                  href={`/notas/${nota.id}`}
                  className="flex items-center justify-between gap-2 px-4 py-3 hover:bg-gray-50 sm:px-6"
                >
                  <div>
                    <p className="font-medium text-gray-900">{nota.numero}</p>
                    <p className="text-sm text-gray-500">{formatDate(nota.dataEmissao)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge {...notaTipoMap[nota.tipo]} />
                    <span className="text-sm text-gray-600">
                      {nota.valor !== null ? formatCurrency(nota.valor) : "-"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
