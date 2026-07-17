import { prisma } from "@/lib/prisma";
import NovoUsuarioForm from "./NovoUsuarioForm";
import UsuarioRow from "./UsuarioRow";

export default async function UsuariosSection({ meuId }: { meuId: string }) {
  const usuarios = await prisma.user.findMany({
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      podeEditar: true,
      podeVerFinanceiro: true,
      podeExcluir: true,
      podeAcessarConfiguracoes: true,
    },
  });

  return (
    <div className="space-y-4">
      <NovoUsuarioForm />
      <div className="space-y-3">
        {usuarios.map((usuario) => (
          <UsuarioRow key={usuario.id} user={usuario} isSelf={usuario.id === meuId} />
        ))}
      </div>
    </div>
  );
}
