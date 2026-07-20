import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import OSForm from "@/components/OSForm";
import FormPageHeader from "@/components/ui/FormPageHeader";
import { createOS } from "../actions";

export default async function NovaOSPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string }>;
}) {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");
  if (!usuario.permissoes.verOS) redirect("/");
  if (!usuario.permissoes.editarOS) redirect("/os");

  const { clienteId } = await searchParams;
  const [clientes, mecanicos] = await Promise.all([
    prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
    prisma.mecanico.findMany({ where: { ativo: true }, orderBy: { nome: "asc" } }),
  ]);

  return (
    <div className="max-w-2xl">
      <FormPageHeader backHref="/os" backLabel="Ordens de Serviço" title="Nova ordem de serviço" />
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
        <OSForm
          clientes={clientes}
          mecanicos={mecanicos}
          defaultClienteId={clienteId}
          action={createOS}
        />
      </div>
    </div>
  );
}
