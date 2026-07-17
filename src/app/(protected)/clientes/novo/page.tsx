import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/getCurrentUser";
import ClienteForm from "@/components/ClienteForm";
import { createCliente } from "../actions";

export default async function NovoClientePage() {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");
  if (!usuario.permissoes.editar) redirect("/clientes");

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900">Novo cliente</h1>
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
        <ClienteForm action={createCliente} />
      </div>
    </div>
  );
}
