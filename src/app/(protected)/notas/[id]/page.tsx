import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { getSignedPdfUrl } from "@/lib/supabase-storage";
import NotaForm from "@/components/NotaForm";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { updateNota, deleteNota } from "../actions";

export default async function NotaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");
  if (!usuario.permissoes.verNotas) redirect("/");

  const nota = await prisma.nota.findUnique({ where: { id } });

  if (!nota) notFound();

  const [pdfUrl, clientes, ordensRecentes, ordemVinculada] = await Promise.all([
    nota.arquivoPdfPath ? getSignedPdfUrl(nota.arquivoPdfPath) : Promise.resolve(null),
    prisma.cliente.findMany({ orderBy: { nome: "asc" } }),
    prisma.ordemServico.findMany({
      include: { cliente: true },
      orderBy: { id: "desc" },
      take: 100,
    }),
    nota.ordemServicoId
      ? prisma.ordemServico.findUnique({
          where: { id: nota.ordemServicoId },
          include: { cliente: true },
        })
      : Promise.resolve(null),
  ]);

  const ordens =
    ordemVinculada && !ordensRecentes.some((os) => os.id === ordemVinculada.id)
      ? [ordemVinculada, ...ordensRecentes]
      : ordensRecentes;

  const updateNotaWithId = updateNota.bind(null, nota.id);
  const deleteNotaWithId = deleteNota.bind(null, nota.id);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/notas" className="text-sm text-gray-500 hover:underline">
            ← Notas
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-gray-900">
            Nota {nota.numero}
          </h1>
        </div>
        {usuario.permissoes.excluirNotas && (
          <ConfirmModal
            triggerLabel="Excluir nota"
            title="Excluir esta nota?"
            description={`Tem certeza que deseja excluir a nota "${nota.numero}"? O PDF anexado (se houver) também será removido. Essa ação não pode ser desfeita.`}
            action={deleteNotaWithId}
          />
        )}
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
        <NotaForm
          nota={nota}
          pdfUrl={pdfUrl}
          clientes={clientes}
          ordens={ordens.map((os) => ({ id: os.id, clienteNome: os.cliente.nome }))}
          action={updateNotaWithId}
          readOnly={!usuario.permissoes.editarNotas}
        />
      </div>
    </div>
  );
}
