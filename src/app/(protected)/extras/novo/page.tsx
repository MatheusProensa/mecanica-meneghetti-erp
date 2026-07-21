import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import ExtraForm from "@/components/ExtraForm";
import FormPageHeader from "@/components/ui/FormPageHeader";
import { createExtra } from "../actions";

export default async function NovoExtraPage({
  searchParams,
}: {
  searchParams: Promise<{ mecanicoId?: string }>;
}) {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");
  if (!usuario.permissoes.verExtras || !usuario.permissoes.editarExtras) redirect("/extras");

  const { mecanicoId } = await searchParams;
  const [mecanicos, clientes, ordens] = await Promise.all([
    prisma.mecanico.findMany({ orderBy: { nome: "asc" } }),
    prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
    prisma.ordemServico.findMany({
      include: { cliente: true },
      orderBy: { id: "desc" },
      take: 100,
    }),
  ]);

  return (
    <div className="max-w-2xl">
      <FormPageHeader backHref="/extras" backLabel="Extras" title="Novo extra" />
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-[var(--shadow-card)]">
        <ExtraForm
          mecanicos={mecanicos}
          clientes={clientes}
          ordens={ordens.map((os) => ({ id: os.id, clienteNome: os.cliente.nome }))}
          defaultMecanicoId={mecanicoId}
          action={createExtra}
        />
      </div>
    </div>
  );
}
