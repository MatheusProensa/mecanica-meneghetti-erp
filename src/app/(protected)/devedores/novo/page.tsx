import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import DividaForm from "@/components/DividaForm";
import FormPageHeader from "@/components/ui/FormPageHeader";
import { createDivida } from "../actions";

export default async function NovaDividaPage({
  searchParams,
}: {
  searchParams: Promise<{ clienteId?: string }>;
}) {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");
  if (!usuario.permissoes.verDevedores || !usuario.permissoes.editarDevedores) redirect("/devedores");

  const { clienteId } = await searchParams;
  const clientes = await prisma.cliente.findMany({ orderBy: { nome: "asc" } });

  return (
    <div className="max-w-2xl">
      <FormPageHeader backHref="/devedores" backLabel="Devedores" title="Nova dívida" />
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 sm:p-6 shadow-[var(--shadow-card)]">
        <DividaForm clientes={clientes} defaultClienteId={clienteId} action={createDivida} />
      </div>
    </div>
  );
}
