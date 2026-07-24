import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/getCurrentUser";
import { getEmpresa } from "@/lib/getEmpresa";
import PageHero from "@/components/ui/PageHero";
import CalculadoraServico from "./CalculadoraServico";

export default async function CalculadoraPage() {
  const usuario = await getCurrentUser();
  if (!usuario) redirect("/login");

  const empresa = await getEmpresa();

  return (
    <div className="max-w-6xl space-y-6">
      <PageHero
        title="Calculadora de Serviço"
        description="Facilita a formação do preço: mão de obra do torno e material usado."
      />

      <CalculadoraServico
        valorHoraTornoInicial={empresa.valorHoraTorno}
        valorKgBarraRedondaInicial={empresa.valorKgBarraRedonda}
      />
    </div>
  );
}
