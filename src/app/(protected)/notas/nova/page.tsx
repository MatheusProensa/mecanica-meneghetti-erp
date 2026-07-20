import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import NotaForm from "@/components/NotaForm";
import FormPageHeader from "@/components/ui/FormPageHeader";
import { createNota } from "../actions";

export default async function NovaNotaPage() {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");
  if (!usuario.permissoes.verNotas) redirect("/");
  if (!usuario.permissoes.editarNotas) redirect("/notas");

  const [clientes, ordens] = await Promise.all([
    prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
    prisma.ordemServico.findMany({
      include: { cliente: true },
      orderBy: { id: "desc" },
      take: 100,
    }),
  ]);

  return (
    <div className="max-w-2xl">
      <FormPageHeader backHref="/notas" backLabel="Notas" title="Nova nota" />
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
        <NotaForm
          clientes={clientes}
          ordens={ordens.map((os) => ({ id: os.id, clienteNome: os.cliente.nome }))}
          action={createNota}
        />
      </div>
    </div>
  );
}
