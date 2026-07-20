import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/getCurrentUser";
import ClienteForm from "@/components/ClienteForm";
import FormPageHeader from "@/components/ui/FormPageHeader";
import { createCliente } from "../actions";

export default async function NovoClientePage() {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");
  if (!usuario.permissoes.verClientes) redirect("/");
  if (!usuario.permissoes.editarClientes) redirect("/clientes");

  return (
    <div className="max-w-2xl">
      <FormPageHeader backHref="/clientes" backLabel="Clientes" title="Novo cliente" />
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
        <ClienteForm action={createCliente} />
      </div>
    </div>
  );
}
