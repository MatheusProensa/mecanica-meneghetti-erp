"use client";

import { useActionState, useState } from "react";
import { ChevronDown } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";
import PermissoesFields from "./PermissoesFields";
import { updateUsuarioPermissoes, deleteUsuario, resetSenhaUsuario } from "./usuarios-actions";

const ROLE_LABEL: Record<string, string> = {
  dono: "Administrador",
  funcionario: "Funcionário",
  visualizador: "Visualizador",
};

export default function UsuarioRow({
  user,
  isSelf,
}: {
  user: {
    id: string;
    name: string;
    email: string;
    role: "dono" | "funcionario" | "visualizador";
    podeVerDashboard: boolean;
    podeVerClientes: boolean;
    podeEditarClientes: boolean;
    podeExcluirClientes: boolean;
    podeVerOS: boolean;
    podeEditarOS: boolean;
    podeExcluirOS: boolean;
    podeVerFinanceiro: boolean;
    podeEditarFinanceiro: boolean;
    podeExcluirFinanceiro: boolean;
    podeVerDevedores: boolean;
    podeEditarDevedores: boolean;
    podeExcluirDevedores: boolean;
    podeVerExtras: boolean;
    podeEditarExtras: boolean;
    podeExcluirExtras: boolean;
    podeVerNotas: boolean;
    podeEditarNotas: boolean;
    podeExcluirNotas: boolean;
    podeAcessarConfiguracoes: boolean;
  };
  isSelf: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const [role, setRole] = useState(user.role);
  const [showReset, setShowReset] = useState(false);
  const [updateMessage, updateAction, updatePending] = useActionState(
    updateUsuarioPermissoes.bind(null, user.id),
    undefined
  );
  const [resetMessage, resetAction, resetPending] = useActionState(
    resetSenhaUsuario.bind(null, user.id),
    undefined
  );
  const deleteWithId = deleteUsuario.bind(null, user.id);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3.5 text-left hover:bg-gray-50 sm:px-6"
      >
        <div className="flex items-center gap-2">
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${aberto ? "rotate-180" : ""}`}
          />
          <p className="font-medium text-gray-900">
            {user.name}
            {isSelf && <span className="ml-1.5 text-xs text-gray-400">(você)</span>}
          </p>
        </div>
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
          {ROLE_LABEL[user.role]}
        </span>
      </button>

      {aberto && (
        <div className="border-t border-gray-100 p-4 sm:p-6">
          <form action={updateAction} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500">Perfil</label>
              <select
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value as typeof role)}
                className="mt-1 w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="dono">Administrador (acesso total)</option>
                <option value="funcionario">Funcionário</option>
                <option value="visualizador">Visualizador (só olha)</option>
              </select>
            </div>

            {(role === "funcionario" || role === "visualizador") && (
              <PermissoesFields role={role} defaults={user} />
            )}

            {updateMessage && (
              <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {updateMessage}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="submit"
                disabled={updatePending}
                className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {updatePending ? "Salvando..." : "Salvar"}
              </button>
              {!isSelf && (
                <button
                  type="button"
                  onClick={() => setShowReset((v) => !v)}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Redefinir senha
                </button>
              )}
              {!isSelf && (
                <button
                  type="submit"
                  formAction={deleteWithId}
                  className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Excluir usuário
                </button>
              )}
            </div>
          </form>

          {!isSelf && showReset && (
            <form
              action={resetAction}
              className="mt-3 flex flex-wrap items-end gap-2 border-t border-gray-100 pt-3"
            >
              <div>
                <label className="block text-xs font-medium text-gray-500">Nova senha</label>
                <PasswordInput
                  name="novaSenha"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  wrapperClassName="mt-1"
                  className="rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={resetPending}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                {resetPending ? "Redefinindo..." : "Redefinir"}
              </button>
              {resetMessage && (
                <p className="w-full rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                  {resetMessage}
                </p>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
}
