export interface PermissoesValues {
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
}

const PAGINAS: {
  label: string;
  ver: keyof PermissoesValues;
  editar?: keyof PermissoesValues;
  excluir?: keyof PermissoesValues;
}[] = [
  { label: "Dashboard", ver: "podeVerDashboard" },
  { label: "Clientes", ver: "podeVerClientes", editar: "podeEditarClientes", excluir: "podeExcluirClientes" },
  { label: "Ordens de Serviço", ver: "podeVerOS", editar: "podeEditarOS", excluir: "podeExcluirOS" },
  { label: "Financeiro", ver: "podeVerFinanceiro", editar: "podeEditarFinanceiro", excluir: "podeExcluirFinanceiro" },
  { label: "Devedores", ver: "podeVerDevedores", editar: "podeEditarDevedores", excluir: "podeExcluirDevedores" },
  { label: "Extras", ver: "podeVerExtras", editar: "podeEditarExtras", excluir: "podeExcluirExtras" },
  { label: "Notas", ver: "podeVerNotas", editar: "podeEditarNotas", excluir: "podeExcluirNotas" },
];

export default function PermissoesFields({
  role,
  defaults,
}: {
  role: "funcionario" | "visualizador";
  defaults?: PermissoesValues;
}) {
  const check = (key: keyof PermissoesValues, defaultTrue = true) =>
    defaults ? defaults[key] : defaultTrue;

  return (
    <div className="space-y-3 rounded-lg bg-gray-50 p-3">
      <p className="text-xs font-medium text-gray-600">
        {role === "visualizador" ? "O que esse usuário pode ver:" : "O que esse usuário pode fazer:"}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-600">
              <th className="pb-1 text-left font-medium">Página</th>
              <th className="px-2 pb-1 font-medium">Ver</th>
              {role === "funcionario" && (
                <>
                  <th className="px-2 pb-1 font-medium">Editar</th>
                  <th className="px-2 pb-1 font-medium">Excluir</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {PAGINAS.map((p) => (
              <tr key={p.label} className="border-t border-gray-200">
                <td className="py-2 pr-2 text-gray-700">{p.label}</td>
                <td className="px-2 py-2 text-center">
                  <input
                    type="checkbox"
                    name={p.ver}
                    defaultChecked={check(p.ver)}
                    className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-blue-500"
                  />
                </td>
                {role === "funcionario" && (
                  <>
                    <td className="px-2 py-2 text-center">
                      {p.editar ? (
                        <input
                          type="checkbox"
                          name={p.editar}
                          defaultChecked={check(p.editar)}
                          className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-2 py-2 text-center">
                      {p.excluir ? (
                        <input
                          type="checkbox"
                          name={p.excluir}
                          defaultChecked={check(p.excluir)}
                          className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {role === "funcionario" && (
        <label className="flex items-center gap-2 border-t border-gray-200 pt-3 text-sm text-gray-700">
          <input
            type="checkbox"
            name="podeAcessarConfiguracoes"
            defaultChecked={check("podeAcessarConfiguracoes", false)}
            className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-blue-500"
          />
          Acessar Configurações
        </label>
      )}
    </div>
  );
}
