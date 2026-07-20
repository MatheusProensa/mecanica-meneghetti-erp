import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/getCurrentUser";
import type { Permission } from "@/lib/permissions";

const secoes: { titulo: string; texto: string; requer: Permission | null }[] = [
  {
    titulo: "Dashboard",
    texto:
      "Mostra um resumo geral: saldo em caixa, valores a receber, recebidos no mês, despesas, lucro líquido, OS em aberto, contas vencidas e os últimos cadastros feitos no sistema.",
    requer: null,
  },
  {
    titulo: "Clientes",
    texto:
      "Cadastre os clientes da oficina. Na página de cada cliente você vê o histórico de ordens de serviço, o total já gasto, as notas vinculadas e as dívidas antigas em aberto.",
    requer: null,
  },
  {
    titulo: "Ordens de Serviço",
    texto:
      "Cada OS é vinculada a um cliente e tem uma lista de serviços/peças com valores. O total é calculado automaticamente somando os itens. Dá pra marcar status, marcar como paga, anexar fotos e cobrar no WhatsApp quando estiver em atraso.",
    requer: null,
  },
  {
    titulo: "Financeiro",
    texto:
      "Mostra o que entrou, o que falta receber e as despesas da oficina no mês. Dá pra cadastrar despesas, filtrar por mês/ano ou por período personalizado, e exportar tudo em CSV ou PDF.",
    requer: "verFinanceiro",
  },
  {
    titulo: "Saldo em aberto",
    texto:
      "Pra clientes com serviços antigos em aberto. Cada dívida é montada por itens (data, descrição e valor de cada serviço) em vez de um valor único, e o total é somado automaticamente — fica fácil conferir e enviar o detalhamento pro cliente. Mostra também quanto já foi pago e o saldo restante. Dá pra registrar pagamentos parciais (o saldo é abatido automaticamente), anexar fotos e filtrar por cliente, período ou situação (em aberto, pagando, quitado). Esses pagamentos não entram no faturamento do mês do Financeiro — são tratados à parte, como recuperação de dívida.",
    requer: "verFinanceiro",
  },
  {
    titulo: "Extras",
    texto:
      "Controla pagamentos extras a funcionários vinculados a um cliente e/ou uma OS específica. Mostra o valor cobrado do cliente, o extra do funcionário e o lucro da empresa (calculado automaticamente). Também dá pra registrar pagamentos parciais do extra e acompanhar a situação (pendente, parcialmente pago, pago).",
    requer: "verFinanceiro",
  },
  {
    titulo: "Notas",
    texto:
      "Registre notas emitidas (valores a receber de clientes) e recebidas (valores a pagar a fornecedores). É possível anexar o PDF da nota e vincular a um cliente e/ou a uma OS.",
    requer: null,
  },
  {
    titulo: "Configurações",
    texto:
      "Trocar sua senha, editar os dados da oficina (usados no PDF de cobrança), cadastrar sua chave Pix, gerenciar os mecânicos da oficina e, se você for Dono, criar logins novos e controlar o que cada Funcionário pode ver ou fazer no sistema.",
    requer: null,
  },
];

export default async function AjudaPage() {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");

  const secoesVisiveis = secoes.filter((s) => !s.requer || usuario.permissoes[s.requer]);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Ajuda</h1>
      <p className="text-sm text-gray-600">
        Um resumo rápido de como usar cada parte do sistema.
      </p>

      <div className="space-y-4">
        {secoesVisiveis.map((secao) => (
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
