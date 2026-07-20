import Link from "next/link";
import { Search } from "lucide-react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { getEmpresa } from "@/lib/getEmpresa";
import type { Prisma, StatusOS } from "@/generated/prisma/client";
import PageHeader from "@/components/ui/PageHeader";
import { osStatusMap, pagamentoInfo } from "@/components/ui/StatusBadge";
import { PAGE_SIZE } from "@/components/ui/Pagination";
import OSResultados from "./OSResultados";

const PAGAMENTO_LABEL: Record<string, string> = {
  pago: "Pagos",
  a_receber: "A receber",
  atrasado: "Atrasados",
};

export default async function OSListPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    q?: string;
    pagamento?: string;
    ordenar?: string;
    pagina?: string;
  }>;
}) {
  const { status, q, pagamento, ordenar, pagina: paginaRaw } = await searchParams;
  const pagina = Math.max(1, Number(paginaRaw) || 1);
  const ordenarPorCliente = ordenar === "az";

  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");
  if (!usuario.permissoes.verOS) redirect("/");

  const numeroBuscado = q ? Number(q.replace(/\D/g, "")) : null;

  const condicoes: Prisma.OrdemServicoWhereInput[] = [];
  if (status) condicoes.push({ status: status as StatusOS });
  if (pagamento === "pago") condicoes.push({ pago: true });
  if (pagamento === "a_receber") {
    // "A receber" mostra só quem ainda está dentro do prazo (ou sem previsão definida) —
    // quem já venceu entra no filtro "Atrasados", não nos dois ao mesmo tempo.
    condicoes.push({
      pago: false,
      OR: [{ previsaoEntrega: null }, { previsaoEntrega: { gte: new Date() } }],
    });
  }
  if (pagamento === "atrasado") {
    condicoes.push({ pago: false, previsaoEntrega: { lt: new Date() } });
  }
  if (q) {
    condicoes.push({
      OR: [
        { cliente: { nome: { contains: q, mode: "insensitive" } } },
        ...(numeroBuscado ? [{ id: numeroBuscado }] : []),
      ],
    });
  }

  const where: Prisma.OrdemServicoWhereInput = condicoes.length > 0 ? { AND: condicoes } : {};

  // undefined = mantém o filtro atual da URL; null = remove o filtro
  function osHref(overrides: {
    status?: string | null;
    pagamento?: string | null;
    ordenar?: string | null;
  }) {
    const nextStatus = "status" in overrides ? overrides.status : status;
    const nextPagamento = "pagamento" in overrides ? overrides.pagamento : pagamento;
    const nextOrdenar = "ordenar" in overrides ? overrides.ordenar : ordenar;

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (nextStatus) params.set("status", nextStatus);
    if (nextPagamento) params.set("pagamento", nextPagamento);
    if (nextOrdenar) params.set("ordenar", nextOrdenar);
    const qs = params.toString();
    return qs ? `/os?${qs}` : "/os";
  }

  const [ordens, totalOrdens, todasOrdens, empresa] = await Promise.all([
    prisma.ordemServico.findMany({
      where,
      include: { cliente: true, itens: true },
      orderBy: ordenarPorCliente ? { cliente: { nome: "asc" } } : { data: "desc" },
      skip: (pagina - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.ordemServico.count({ where }),
    prisma.ordemServico.findMany({
      where,
      include: { cliente: true, itens: true },
      orderBy: ordenarPorCliente ? { cliente: { nome: "asc" } } : { data: "desc" },
    }),
    getEmpresa(),
  ]);

  const periodoLabelPartes: string[] = [];
  if (status) periodoLabelPartes.push(osStatusMap[status]?.label ?? status);
  if (pagamento) periodoLabelPartes.push(PAGAMENTO_LABEL[pagamento] ?? pagamento);
  if (q) periodoLabelPartes.push(`busca: "${q}"`);
  const periodoLabel = periodoLabelPartes.join(" · ");

  return (
    <div>
      <PageHeader
        title="Ordens de Serviço"
        action={usuario.permissoes.editarOS ? { label: "+ Nova OS", href: "/os/nova" } : undefined}
      />

      <form className="mt-4 flex flex-wrap items-center gap-3">
        {status && <input type="hidden" name="status" value={status} />}
        {pagamento && <input type="hidden" name="pagamento" value={pagamento} />}
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            autoComplete="off"
            placeholder="Buscar por número (#0001) ou cliente..."
            className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Buscar
        </button>
      </form>

      <div className="mt-4">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Status</p>
        <div className="mt-1.5 flex flex-wrap gap-2">
          <FilterLink label="Todas" href={osHref({ status: null })} active={!status} />
          {Object.entries(osStatusMap).map(([value, { label }]) => (
            <FilterLink
              key={value}
              label={label}
              href={osHref({ status: value })}
              active={status === value}
            />
          ))}
        </div>
      </div>

      <div className="mt-3">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Pagamento</p>
        <div className="mt-1.5 flex flex-wrap gap-2">
          <FilterLink
            label="Todos pagamentos"
            href={osHref({ pagamento: null })}
            active={!pagamento}
          />
          <FilterLink
            label="A receber"
            href={osHref({ pagamento: "a_receber" })}
            active={pagamento === "a_receber"}
          />
          <FilterLink
            label="Pagos"
            href={osHref({ pagamento: "pago" })}
            active={pagamento === "pago"}
          />
          <FilterLink
            label="Atrasados"
            href={osHref({ pagamento: "atrasado" })}
            active={pagamento === "atrasado"}
          />
        </div>
      </div>

      <div className="mt-3">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Ordenar</p>
        <div className="mt-1.5 flex flex-wrap gap-2">
          <FilterLink
            label="Mais recentes"
            href={osHref({ ordenar: null })}
            active={!ordenarPorCliente}
          />
          <FilterLink
            label="Cliente (A-Z)"
            href={osHref({ ordenar: "az" })}
            active={ordenarPorCliente}
          />
        </div>
      </div>

      <OSResultados
        pagAtual={ordens.map((os) => ({
          id: os.id,
          clienteNome: os.cliente.nome,
          telefone: os.telefone ?? os.cliente.telefone ?? os.cliente.whatsapp,
          data: os.data,
          status: os.status,
          pago: os.pago,
          previsaoEntrega: os.previsaoEntrega,
          valor: os.itens.reduce((s, i) => s + i.valor, 0),
        }))}
        paraExportar={todasOrdens.map((os) => ({
          id: os.id,
          clienteNome: os.cliente.nome,
          data: os.data,
          statusLabel: osStatusMap[os.status]?.label ?? os.status,
          pagamentoLabel: pagamentoInfo(os).label,
          valor: os.itens.reduce((s, i) => s + i.valor, 0),
        }))}
        totalOrdens={totalOrdens}
        empresa={empresa}
        periodoLabel={periodoLabel}
        pagina={pagina}
        status={status}
        q={q}
        pagamento={pagamento}
        ordenar={ordenar}
        podeEditar={usuario.permissoes.editarOS}
      />
    </div>
  );
}

function FilterLink({
  label,
  href,
  active,
}: {
  label: string;
  href: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        active
          ? "bg-blue-600 text-white"
          : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
      }`}
    >
      {label}
    </Link>
  );
}
