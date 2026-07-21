import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/getCurrentUser";
import type { Permission } from "@/lib/permissions";
import PageHero from "@/components/ui/PageHero";
import type { IconName } from "@/components/ui/icon-map";
import { iconMap } from "@/components/ui/icon-map";

const secoes: {
  titulo: string;
  texto: string;
  requer: Permission | null;
  icon: IconName;
  iconColor: string;
}[] = [
  {
    titulo: "Dashboard",
    texto:
      "Mostra um resumo geral: saldo em caixa, valores a receber, recebidos no mês, despesas, lucro líquido, OS em aberto, contas vencidas e os últimos cadastros feitos no sistema.",
    requer: "verDashboard",
    icon: "layout-dashboard",
    iconColor: "text-gray-600",
  },
  {
    titulo: "Clientes",
    texto:
      "Cadastre os clientes da oficina. Na página de cada cliente você vê o histórico de ordens de serviço, o total já gasto, as notas vinculadas e as dívidas antigas em aberto.",
    requer: "verClientes",
    icon: "users",
    iconColor: "text-brand-600",
  },
  {
    titulo: "Ordens de Serviço",
    texto:
      "Cada OS é vinculada a um cliente e tem uma lista de serviços/peças, cada um com sua própria data e valor. O total é calculado automaticamente somando os itens. Dá pra marcar status, marcar como paga, anexar fotos, cobrar no WhatsApp quando estiver em atraso, ordenar a lista por cliente (A-Z) e exportar um PDF — de tudo que está filtrado na tela ou só das OS marcadas com a caixinha de seleção.",
    requer: "verOS",
    icon: "tools",
    iconColor: "text-brand-600",
  },
  {
    titulo: "Financeiro",
    texto:
      "Mostra o que entrou, o que falta receber e as despesas da oficina no mês. Dá pra cadastrar despesas, filtrar por mês/ano ou por período personalizado, e exportar em CSV ou PDF — de tudo que está filtrado ou só das despesas marcadas com a caixinha de seleção.",
    requer: "verFinanceiro",
    icon: "wallet",
    iconColor: "text-green-600",
  },
  {
    titulo: "Devedores",
    texto:
      "Pra clientes com serviços antigos em aberto. Cada dívida é montada por itens (data, descrição e valor de cada serviço) em vez de um valor único, e o total é somado automaticamente — fica fácil conferir e enviar o detalhamento pro cliente. Mostra também quanto já foi pago e o saldo restante. Dá pra registrar pagamentos parciais (o saldo é abatido automaticamente), anexar fotos e filtrar por cliente, período ou situação (em aberto, pagando, quitado). Esses pagamentos não entram no faturamento do mês do Financeiro — são tratados à parte, como recuperação de dívida.",
    requer: "verDevedores",
    icon: "user-x",
    iconColor: "text-red-600",
  },
  {
    titulo: "Extras",
    texto:
      "Controla pagamentos extras a funcionários vinculados a um cliente e/ou uma OS específica. Mostra o valor cobrado do cliente, o extra do funcionário e o lucro da empresa (calculado automaticamente). Também dá pra registrar pagamentos parciais do extra e acompanhar a situação (pendente, parcialmente pago, pago).",
    requer: "verExtras",
    icon: "hand-coins",
    iconColor: "text-amber-600",
  },
  {
    titulo: "Notas",
    texto:
      "Registre notas emitidas (valores a receber de clientes) e recebidas (valores a pagar a fornecedores). É possível anexar o PDF da nota e vincular a um cliente e/ou a uma OS.",
    requer: "verNotas",
    icon: "file-text",
    iconColor: "text-gray-600",
  },
  {
    titulo: "Configurações",
    texto:
      "Trocar sua senha, editar os dados da oficina (usados no PDF de cobrança), cadastrar sua chave Pix, gerenciar os mecânicos da oficina e, se você for Administrador, criar logins novos e controlar o que cada Funcionário pode ver ou fazer no sistema.",
    requer: null,
    icon: "settings",
    iconColor: "text-gray-600",
  },
];

const iconBgByColor: Record<string, string> = {
  "text-green-600": "bg-green-50",
  "text-red-600": "bg-red-50",
  "text-amber-600": "bg-amber-50",
  "text-brand-600": "bg-blue-50",
  "text-gray-600": "bg-gray-100",
};

export default async function AjudaPage() {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");

  const secoesVisiveis = secoes.filter((s) => !s.requer || usuario.permissoes[s.requer]);

  return (
    <div className="max-w-2xl space-y-6">
      <PageHero title="Ajuda" description="Um resumo rápido de como usar cada parte do sistema." />

      <div className="space-y-4">
        {secoesVisiveis.map((secao) => {
          const Icon = iconMap[secao.icon];
          const iconBg = iconBgByColor[secao.iconColor] ?? "bg-gray-100";
          return (
            <div
              key={secao.titulo}
              className="rounded-lg border border-gray-200 bg-white p-5"
            >
              <div className="flex items-center gap-2.5">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
                  <Icon className={`h-4 w-4 ${secao.iconColor}`} />
                </span>
                <h2 className="text-sm font-semibold text-gray-900">{secao.titulo}</h2>
              </div>
              <p className="mt-2 text-sm text-gray-600">{secao.texto}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
