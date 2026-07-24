"use client";

import { useMemo, useState, useTransition } from "react";
import { Clock, Package, Save } from "lucide-react";
import CurrencyInput from "@/components/CurrencyInput";
import { formatCurrency, parseCurrencyBR } from "@/lib/format";
import { TABELA_BARRA_REDONDA, calcularMaterial, calcularValorHora } from "@/lib/materiais";
import { salvarValorHoraTorno, salvarValorMaterial } from "./actions";

export interface MaterialCalculadoraItem {
  id: string;
  nome: string;
  valorKg: number;
  densidade: number;
}

export default function CalculadoraServico({
  valorHoraTornoInicial,
  materiais,
}: {
  valorHoraTornoInicial: number;
  materiais: MaterialCalculadoraItem[];
}) {
  const [horas, setHoras] = useState("0");
  const [minutos, setMinutos] = useState("0");
  const [valorHoraStr, setValorHoraStr] = useState(valorHoraTornoInicial.toFixed(2).replace(".", ","));
  const [salvandoHora, startTransitionHora] = useTransition();
  const [mensagemHora, setMensagemHora] = useState<string | null>(null);

  const [materialId, setMaterialId] = useState(materiais[0]?.id ?? "");
  const [diametro, setDiametro] = useState("25");
  const [comprimento, setComprimento] = useState("1");
  const [unidade, setUnidade] = useState<"m" | "cm">("m");
  const [valorKgStr, setValorKgStr] = useState(() =>
    (materiais[0]?.valorKg ?? 0).toFixed(2).replace(".", ",")
  );
  const [salvandoMaterial, startTransitionMaterial] = useTransition();
  const [mensagemMaterial, setMensagemMaterial] = useState<string | null>(null);

  const valorHora = parseCurrencyBR(valorHoraStr);
  const valorKg = parseCurrencyBR(valorKgStr);
  const materialSelecionado = materiais.find((m) => m.id === materialId) ?? materiais[0];

  const valorMaoDeObra = useMemo(
    () => calcularValorHora(Number(horas) || 0, Number(minutos) || 0, valorHora),
    [horas, minutos, valorHora]
  );

  const resultadoMaterial = useMemo(() => {
    if (!materialSelecionado) return { kgPorMetro: 0, pesoKg: 0, valor: 0 };
    const comprimentoM = unidade === "cm" ? (Number(comprimento) || 0) / 100 : Number(comprimento) || 0;
    return calcularMaterial(materialSelecionado.nome, Number(diametro) || 0, comprimentoM, valorKg, materialSelecionado.densidade);
  }, [materialSelecionado, diametro, comprimento, unidade, valorKg]);

  const total = valorMaoDeObra + resultadoMaterial.valor;

  function trocarMaterial(id: string) {
    setMaterialId(id);
    const material = materiais.find((m) => m.id === id);
    if (material) setValorKgStr(material.valorKg.toFixed(2).replace(".", ","));
    setMensagemMaterial(null);
  }

  function salvarHoraPadrao() {
    setMensagemHora(null);
    const formData = new FormData();
    formData.set("valorHoraTorno", String(valorHora));
    startTransitionHora(async () => {
      try {
        await salvarValorHoraTorno(formData);
        setMensagemHora("Salvo.");
      } catch {
        setMensagemHora("Não foi possível salvar.");
      }
    });
  }

  function salvarValorKgMaterial() {
    if (!materialSelecionado) return;
    setMensagemMaterial(null);
    const formData = new FormData();
    formData.set("id", materialSelecionado.id);
    formData.set("valorKg", String(valorKg));
    startTransitionMaterial(async () => {
      try {
        await salvarValorMaterial(formData);
        setMensagemMaterial("Salvo.");
      } catch {
        setMensagemMaterial("Não foi possível salvar.");
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
            <h2 className="text-sm font-semibold text-gray-900">Cálculo da Hora do Torno</h2>
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
              <div className="mt-1 flex items-center gap-2">
                <CurrencyInput
                  id="valorHora"
                  value={valorHoraStr}
                  onChange={setValorHoraStr}
                  className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={salvarHoraPadrao}
                  disabled={salvandoHora}
                  title="Salvar como valor padrão"
                  className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                </button>
              </div>
              {mensagemHora && <p className="mt-1 text-xs text-gray-500">{mensagemHora}</p>}
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
            <h2 className="text-sm font-semibold text-gray-900">Cálculo do Material</h2>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label htmlFor="tipoMaterial" className="block text-sm font-medium text-gray-700">
                Tipo do material
              </label>
              <select
                id="tipoMaterial"
                value={materialId}
                onChange={(e) => trocarMaterial(e.target.value)}
                className="select-compact mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {materiais.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.nome}
                  </option>
                ))}
              </select>
            </div>
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
          </div>

          <div className="mt-4 rounded-lg bg-gray-50 p-3">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="valorKg" className="text-xs font-medium text-gray-600">
                Valor do kg cadastrado — {materialSelecionado?.nome}
              </label>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <CurrencyInput
                id="valorKg"
                value={valorKgStr}
                onChange={setValorKgStr}
                className="w-full rounded-md border border-gray-300 bg-white py-1.5 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={salvarValorKgMaterial}
                disabled={salvandoMaterial}
                title="Salvar como valor padrão desse material"
                className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-60"
              >
                <Save className="h-3.5 w-3.5" />
              </button>
            </div>
            {mensagemMaterial && <p className="mt-1 text-xs text-gray-500">{mensagemMaterial}</p>}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
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

          {materialSelecionado?.nome === "Aço 1020" && (
            <p className="mt-3 text-xs text-gray-500">
              Bitolas de referência (kg/m):{" "}
              {TABELA_BARRA_REDONDA.map((b) => `Ø${b.diametroMm}mm = ${b.kgPorMetro}`).join(" · ")}
            </p>
          )}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-blue-800 shadow-[var(--shadow-card)]">
        <div className="p-5 text-center sm:p-6 sm:text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">Total estimado do serviço</p>
          <p className="mt-1 text-4xl font-bold text-white">{formatCurrency(total)}</p>
        </div>
        <div className="flex flex-col divide-y divide-white/15 border-t border-white/15 bg-black/10 sm:flex-row sm:divide-x sm:divide-y-0">
          <div className="flex flex-1 items-center justify-between gap-2 px-5 py-3 sm:justify-center sm:gap-3 sm:py-4">
            <span className="flex items-center gap-1.5 text-sm text-blue-100">
              <Clock className="h-4 w-4" />
              Mão de obra
            </span>
            <span className="text-sm font-bold text-white">{formatCurrency(valorMaoDeObra)}</span>
          </div>
          <div className="flex flex-1 items-center justify-between gap-2 px-5 py-3 sm:justify-center sm:gap-3 sm:py-4">
            <span className="flex items-center gap-1.5 text-sm text-blue-100">
              <Package className="h-4 w-4" />
              Material
            </span>
            <span className="text-sm font-bold text-white">{formatCurrency(resultadoMaterial.valor)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
