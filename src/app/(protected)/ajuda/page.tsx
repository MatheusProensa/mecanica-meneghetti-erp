const secoes = [
  {
    titulo: "Dashboard",
    texto:
      "Mostra um resumo geral: saldo em caixa, valores a receber, recebidos no mês, despesas, lucro líquido, OS em aberto, contas vencidas e os últimos cadastros feitos no sistema.",
  },
  {
    titulo: "Clientes",
    texto:
      "Cadastre os clientes da oficina. Na página de cada cliente você vê o histórico de ordens de serviço, o total já gasto e se há alguma dívida em aberto.",
  },
  {
    titulo: "Ordens de Serviço",
    texto:
      "Cada OS é vinculada a um cliente e tem uma lista de serviços/peças com valores. O total é calculado automaticamente somando os itens.",
  },
  {
    titulo: "Notas",
    texto:
      "Registre notas emitidas (valores a receber de clientes) e recebidas (valores a pagar a fornecedores). É possível anexar o PDF da nota e vincular a uma OS.",
  },
];

export default function AjudaPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Ajuda</h1>
      <p className="text-sm text-gray-600">
        Um resumo rápido de como usar cada parte do sistema.
      </p>

      <div className="space-y-4">
        {secoes.map((secao) => (
          <div
            key={secao.titulo}
            className="rounded-lg border border-gray-200 bg-white p-5"
          >
            <h2 className="text-sm font-semibold text-gray-900">{secao.titulo}</h2>
            <p className="mt-1 text-sm text-gray-600">{secao.texto}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
