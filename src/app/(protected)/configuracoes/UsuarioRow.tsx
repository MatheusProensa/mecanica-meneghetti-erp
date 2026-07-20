"use client";

import { useState } from "react";
import PasswordInput from "@/components/PasswordInput";
import { updateUsuarioPermissoes, deleteUsuario, resetSenhaUsuario } from "./usuarios-actions";

const ROLE_LABEL: Record<string, string> = {
  dono: "Dono",
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
    podeEditar: boolean;
    podeVerFinanceiro: boolean;
    podeExcluir: boolean;
    podeAcessarConfiguracoes: boolean;
  };
  isSelf: boolean;
}) {
  const [role, setRole] = useState(user.role);
  const [showReset, setShowReset] = useState(false);
  const updateWithId = updateUsuarioPermissoes.bind(null, user.id);
  const deleteWithId = deleteUsuario.bind(null, user.id);
  const resetWithId = resetSenhaUsuario.bind(null, user.id);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium text-gray-900">
            {user.name}
            {isSelf && <span className="ml-1.5 text-xs text-gray-400">(você)</span>}
          </p>
        </div>
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
          {ROLE_LABEL[user.role]}
        </span>
      </div>

      <form action={updateWithId} className="mt-4 space-y-3 border-t border-gray-100 pt-4">
        <div>
          <label className="block text-xs font-medium text-gray-500">Perfil</label>
          <select
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value as typeof role)}
            className="mt-1 w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="dono">Dono (acesso total)</option>
            <option value="funcionario">Funcionário</option>
            <option value="visualizador">Visualizador (só olha)</option>
          </select>
        </div>

        {role === "funcionario" && (
          <div className="space-y-2 rounded-lg bg-gray-50 p-3">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="podeEditar"
                defaultChecked={user.podeEditar}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Criar e editar cadastros
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="podeExcluir"
                defaultChecked={user.podeExcluir}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Excluir cadastros
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="podeVerFinanceiro"
                defaultChecked={user.podeVerFinanceiro}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Ver o Financeiro
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="podeAcessarConfiguracoes"
                defaultChecked={user.podeAcessarConfiguracoes}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              Acessar Configurações
            </label>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            Salvar
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
          action={resetWithId}
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
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Redefinir
          </button>
        </form>
      )}
    </div>
  );
}
