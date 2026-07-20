"use client";

import { useActionState, useState } from "react";
import PasswordInput from "@/components/PasswordInput";
import { createUsuario } from "./usuarios-actions";

export default function NovoUsuarioForm() {
  const [message, formAction, pending] = useActionState(createUsuario, undefined);
  const [role, setRole] = useState("funcionario");
  const success = message === "Usuário criado com sucesso.";

  return (
    <form
      action={formAction}
      key={success ? "sucesso" : "form"}
      className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-6"
    >
      <h3 className="text-sm font-semibold text-gray-900">Novo usuário</h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Nome
          </label>
          <input
            id="name"
            name="name"
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            E-mail
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="senha" className="block text-sm font-medium text-gray-700">
            Senha inicial
          </label>
          <PasswordInput
            id="senha"
            name="senha"
            required
            minLength={8}
            autoComplete="new-password"
            wrapperClassName="mt-1"
            className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Perfil
          </label>
          <select
            id="role"
            name="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="dono">Dono (acesso total)</option>
            <option value="funcionario">Funcionário</option>
            <option value="visualizador">Visualizador (só olha)</option>
          </select>
        </div>
      </div>

      {role === "funcionario" && (
        <div className="space-y-2 rounded-lg bg-gray-50 p-3">
          <p className="text-xs font-medium text-gray-500">O que esse funcionário pode fazer:</p>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="podeEditar"
              defaultChecked
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Criar e editar cadastros (Cliente, OS, Nota, Despesa)
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="podeExcluir"
              defaultChecked
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Excluir cadastros (Cliente, OS, Nota, Despesa)
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="podeVerFinanceiro"
              defaultChecked
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Ver o Financeiro (valores, lucro, despesas)
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="podeAcessarConfiguracoes"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Acessar Configurações
          </label>
        </div>
      )}

      {(role === "funcionario" || role === "visualizador") && (
        <div className="space-y-2 rounded-lg bg-gray-50 p-3">
          <p className="text-xs font-medium text-gray-500">O que esse usuário pode ver:</p>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="podeVerClientes"
              defaultChecked
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Clientes
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="podeVerOS"
              defaultChecked
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Ordens de Serviço
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="podeVerNotas"
              defaultChecked
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Notas
          </label>
        </div>
      )}

      {message && (
        <p
          className={`rounded-md px-3 py-2 text-sm ${
            success ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Criando..." : "+ Criar usuário"}
      </button>
    </form>
  );
}
