"use client";

import { useMemo, useState, useTransition } from "react";
import { Clock, Package, Save } from "lucide-react";
import CurrencyInput from "@/components/CurrencyInput";
import { formatCurrency, parseCurrencyBR } from "@/lib/format";
import { TABELA_BARRA_REDONDA, calcularMaterial, calcularValorHora } from "@/lib/materiais";
import { salvarValoresCalculadora } from "./actions";

export default function CalculadoraServico({
  valorHoraTornoInicial,
  valorKgBarraRedondaInicial,
}: {
  valorHoraTornoInicial: number;
  valorKgBarraRedondaInicial: number;
}) {
  const [horas, setHoras] = useState("0");
  const [minutos, setMinutos] = useState("0");
  const [valorHoraStr, setValorHoraStr] = useState(valorHoraTornoInicial.toFixed(2).replace(".", ","));

  const [diametro, setDiametro] = useState("25");
  const [comprimento, setComprimento] = useState("1");
  const [unidade, setUnidade] = useState<"m" | "cm">("m");
  const [valorKgStr, setValorKgStr] = useState(valorKgBarraRedondaInicial.toFixed(2).replace(".", ","));

  const [pending, startTransition] = useTransition();
  const [mensagem, setMensagem] = useState<string | null>(null);

  const valorHora = parseCurrencyBR(valorHoraStr);
  const valorKg = parseCurrencyBR(valorKgStr);

  const valorMaoDeObra = useMemo(
    () => calcularValorHora(Number(horas) || 0, Number(minutos) || 0, valorHora),
    [horas, minutos, valorHora]
  );

  const resultadoMaterial = useMemo(() => {
    const comprimentoM = unidade === "cm" ? (Number(comprimento) || 0) / 100 : Number(comprimento) || 0;
    return calcularMaterial(Number(diametro) || 0, comprimentoM, valorKg);
  }, [diametro, comprimento, unidade, valorKg]);

  const total = valorMaoDeObra + resultadoMaterial.valor;

  function salvarPadroes() {
    setMensagem(null);
    const formData = new FormData();
    formData.set("valorHoraTorno", String(valorHora));
    formData.set("valorKgBarraRedonda", String(valorKg));
    startTransition(async () => {
      try {
        await salvarValoresCalculadora(formData);
        setMensagem("Valores padrão salvos.");
      } catch {
        setMensagem("Não foi possível salvar. Tente de novo.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-brand-600">
              <Clock className="h-4.5 w-4.5" />
            </span>
            <h2 className="text-sm font-semibold text-gray-900">Hora do Torno</h2>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="horas" className="block text-sm font-medium text-gray-700">
                Horas
              </label>
              <input
                id="horas"
                type="number"
                min="0"
                inputMode="numeric"
                value={horas}
                onChange={(e) => setHoras(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="minutos" className="block text-sm font-medium text-gray-700">
                Minutos
              </label>
              <input
                id="minutos"
                type="number"
                min="0"
                max="59"
                inputMode="numeric"
                value={minutos}
                onChange={(e) => setMinutos(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label htmlFor="valorHora" className="block text-sm font-medium text-gray-700">
                Valor da hora
              </label>
              <CurrencyInput
                id="valorHora"
                value={valorHoraStr}
                onChange={setValorHoraStr}
                className="mt-1 w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-5 rounded-lg bg-gray-50 p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Mão de obra</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{formatCurrency(valorMaoDeObra)}</p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Package className="h-4.5 w-4.5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Material</h2>
              <p className="text-xs text-gray-500">Barra redonda de aço</p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="diametro" className="block text-sm font-medium text-gray-700">
                Diâmetro (mm)
              </label>
              <input
                id="diametro"
                type="number"
                min="0"
                inputMode="decimal"
                value={diametro}
                onChange={(e) => setDiametro(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="comprimento" className="block text-sm font-medium text-gray-700">
                Comprimento
              </label>
              <div className="mt-1 flex">
                <input
                  id="comprimento"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={comprimento}
                  onChange={(e) => setComprimento(e.target.value)}
                  className="w-full rounded-l-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <select
                  value={unidade}
                  onChange={(e) => setUnidade(e.target.value as "m" | "cm")}
                  className="select-compact rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="m">m</option>
                  <option value="cm">cm</option>
                </select>
              </div>
            </div>
            <div className="col-span-2">
              <label htmlFor="valorKg" className="block text-sm font-medium text-gray-700">
                Valor do kg
              </label>
              <CurrencyInput
                id="valorKg"
                value={valorKgStr}
                onChange={setValorKgStr}
                className="mt-1 w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Peso calculado</p>
              <p className="mt-1 text-lg font-bold text-gray-900">
                {resultadoMaterial.pesoKg.toLocaleString("pt-BR", { maximumFractionDigits: 3 })} kg
              </p>
            </div>
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Valor do material</p>
              <p className="mt-1 text-lg font-bold text-gray-900">{formatCurrency(resultadoMaterial.valor)}</p>
            </div>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            Bitolas de referência (kg/m):{" "}
            {TABELA_BARRA_REDONDA.map((b) => `Ø${b.diametroMm}mm = ${b.kgPorMetro}`).join(" · ")}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Total estimado do serviço</p>
          <p className="mt-1 text-2xl font-bold text-brand-700">{formatCurrency(total)}</p>
          <p className="mt-1 text-xs text-gray-600">Mão de obra + material</p>
        </div>
        <button
          type="button"
          onClick={salvarPadroes}
          disabled={pending}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {pending ? "Salvando..." : "Salvar valores padrão"}
        </button>
      </div>
      {mensagem && <p className="text-sm text-gray-600">{mensagem}</p>}
    </div>
  );
}
