import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { getEmpresa } from "@/lib/getEmpresa";
import { formatCurrency, formatDate, formatPhoneBR } from "@/lib/format";
import { getSignedOSFotoUrls } from "@/lib/supabase-storage";
import OSForm from "@/components/OSForm";
import OSFotos from "@/components/OSFotos";
import OSPagamentoCard from "@/components/OSPagamentoCard";
import GerarCobrancaOSButton from "@/components/GerarCobrancaOSButton";
import DarkPatternBg from "@/components/ui/DarkPatternBg";
import MetricCard from "@/components/ui/MetricCard";
import ValorOculto from "@/components/ui/ValorOculto";
import CountUp from "@/components/ui/CountUp";
import SectionHeader from "@/components/ui/SectionHeader";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { StatusBadge, osStatusMap } from "@/components/ui/StatusBadge";
import { updateOS, deleteOS } from "../actions";

export default async function OSDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const osId = Number(id);
  if (!Number.isInteger(osId)) notFound();

  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");
  if (!usuario.permissoes.verOS) redirect("/");

  const [os, clientes, mecanicos, session, empresa] = await Promise.all([
    prisma.ordemServico.findUnique({
      where: { id: osId },
      include: {
        itens: true,
        cliente: true,
        mecanico: true,
        anexos: { orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
    prisma.mecanico.findMany({ orderBy: { nome: "asc" } }),
    auth(),
    getEmpresa(),
  ]);

  if (!os) notFound();

  const usuarioPix = session?.user?.email
    ? await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { pixKey: true, dadosBancarios: true },
      })
    : null;

  const urlsPorPath = await getSignedOSFotoUrls(os.anexos.map((a) => a.path));
  const fotos = os.anexos.map((a) => ({ id: a.id, url: urlsPorPath[a.path] ?? null }));

  const valorTotal = os.itens.reduce((s, i) => s + i.valor, 0);
  const descricaoItens = os.itens.map((i) => i.descricao).join(", ");
  const telefoneOS = os.telefone ?? os.cliente.telefone ?? os.cliente.whatsapp;

  const updateOSWithId = updateOS.bind(null, os.id);
  const deleteOSWithId = deleteOS.bind(null, os.id);

  return (
    <div className="max-w-2xl space-y-8">
      <Link href="/os" className="text-sm text-gray-500 hover:underline">
        ← Voltar para ordens de serviço
      </Link>

      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-900 to-gray-800 shadow-sm">
        <DarkPatternBg />
        <div className="relative flex flex-wrap items-start justify-between gap-4 px-5 py-6 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-400">
              Ordem de serviço #{String(os.id).padStart(4, "0")}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">
              {os.cliente.nome}
            </h1>
            <p className="mt-1 text-sm text-gray-300">
              Aberta em {formatDate(os.data)}
              {(os.mecanico?.nome ?? os.mecanicoResponsavel) &&
                ` · Mecânico: ${os.mecanico?.nome ?? os.mecanicoResponsavel}`}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {!os.pago && (
              <GerarCobrancaOSButton
                empresa={empresa}
                cliente={{
                  nome: os.cliente.nome,
                  telefone: formatPhoneBR(telefoneOS) || null,
                  endereco: os.cliente.endereco,
                  cpfCnpj: os.cliente.cpfCnpj,
                }}
                os={{ id: os.id, data: os.data, descricao: descricaoItens, valor: valorTotal }}
                pixKeyPadrao={usuarioPix?.pixKey ?? null}
                dadosBancariosPadrao={usuarioPix?.dadosBancarios ?? null}
              />
            )}
            {usuario.permissoes.excluirOS && (
              <ConfirmModal
                triggerLabel="Excluir"
                triggerClassName="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20"
                title="Excluir esta OS?"
                description={`Tem certeza que deseja excluir a OS #${String(os.id).padStart(4, "0")}? Essa ação não pode ser desfeita.`}
                action={deleteOSWithId}
              />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="flex min-h-[90px] flex-col items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white p-3.5 text-center shadow-[var(--shadow-card)] sm:min-h-[110px] sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 sm:text-xs">
            Status
          </p>
          <StatusBadge {...osStatusMap[os.status]} />
        </div>
        <MetricCard
          icon="calendar"
          iconColor="text-amber-600"
          label="Previsão de entrega"
          value={formatDate(os.previsaoEntrega)}
        />
        <MetricCard
          icon="wallet"
          iconColor="text-brand-600"
          label="Valor total"
          value={<ValorOculto><CountUp value={valorTotal} kind="currency" /></ValorOculto>}
        />
        <OSPagamentoCard
          id={os.id}
          pago={os.pago}
          previsaoEntrega={os.previsaoEntrega}
          readOnly={!usuario.permissoes.editarOS}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-6">
          <h3 className="text-sm font-semibold text-gray-900">Cliente</h3>
          <dl className="mt-3 space-y-2.5 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-gray-500">Nome</dt>
              <dd className="font-medium">
                <Link href={`/clientes/${os.cliente.id}`} className="text-brand-600 hover:underline">
                  {os.cliente.nome}
                </Link>
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-gray-500">Telefone</dt>
              <dd className="font-medium text-gray-900">{formatPhoneBR(telefoneOS) || "-"}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-gray-500">Forma de pagamento</dt>
              <dd className="font-medium text-gray-900">{os.formaPagamento || "-"}</dd>
            </div>
          </dl>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-6">
          <h3 className="text-sm font-semibold text-gray-900">Observações</h3>
          <p className="mt-3 text-sm text-gray-600">{os.observacoes || "Nenhuma observação."}</p>
        </div>
      </div>

      <div>
        <SectionHeader icon="tools" iconColor="text-brand-600" title="Itens de serviço" />
        <div className="mt-4 overflow-hidden rounded-[10px] border border-gray-200 bg-white shadow-[var(--shadow-card)]">
          <div className="h-[3px] bg-brand-600" />
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-gray-500">
              <tr>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                  Valor
                </th>
              </tr>
            </thead>
            <tbody>
              {os.itens.map((item) => (
                <tr key={item.id} className="border-t border-gray-100">
                  <td className="px-6 py-3 text-gray-900">{item.descricao}</td>
                  <td className="px-6 py-3 text-right tabular-nums text-gray-500">
                    {formatCurrency(item.valor)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <SectionHeader icon="settings" iconColor="text-gray-600" title="Editar OS" />
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-6">
          <OSForm
            clientes={clientes}
            mecanicos={mecanicos}
            os={os}
            action={updateOSWithId}
            readOnly={!usuario.permissoes.editarOS}
          />
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-6">
        <OSFotos osId={os.id} fotos={fotos} readOnly={!usuario.permissoes.editarOS} />
      </div>
    </div>
  );
}
