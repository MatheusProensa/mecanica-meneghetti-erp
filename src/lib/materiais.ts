/** Tabela de referência kg/m de barra redonda de Aço 1020, por diâmetro —
 * valores de tabela oficial, mais precisos que a fórmula pura pra bitolas
 * comuns (a densidade cobre as demais). */
export const TABELA_BARRA_REDONDA: { diametroMm: number; kgPorMetro: number }[] = [
  { diametroMm: 25, kgPorMetro: 3.85 },
  { diametroMm: 30, kgPorMetro: 5.55 },
  { diametroMm: 40, kgPorMetro: 9.86 },
  { diametroMm: 50, kgPorMetro: 15.42 },
  { diametroMm: 60, kgPorMetro: 22.2 },
  { diametroMm: 70, kgPorMetro: 30.21 },
  { diametroMm: 80, kgPorMetro: 39.46 },
  { diametroMm: 100, kgPorMetro: 61.65 },
];

const NOME_ACO_1020 = "Aço 1020";

/** kg/m de uma barra redonda a partir do diâmetro (mm) e da densidade do
 * material (kg/m³) — fórmula física padrão (área da seção × densidade). */
export function calcularKgPorMetroPorDensidade(diametroMm: number, densidadeKgM3: number): number {
  const raioM = diametroMm / 1000 / 2;
  const areaM2 = Math.PI * raioM * raioM;
  return areaM2 * densidadeKgM3;
}

/** kg/m de uma barra redonda de Aço 1020 — usa a tabela de referência quando
 * o diâmetro bate com uma bitola comum, senão calcula pela densidade. */
export function calcularKgPorMetro(diametroMm: number, densidadeKgM3 = 7850): number {
  const daTabela = TABELA_BARRA_REDONDA.find((b) => b.diametroMm === diametroMm);
  if (daTabela) return daTabela.kgPorMetro;
  return calcularKgPorMetroPorDensidade(diametroMm, densidadeKgM3);
}

export interface ResultadoMaterial {
  kgPorMetro: number;
  pesoKg: number;
  valor: number;
}

/** Peso e custo do material usado — comprimento sempre em metros. Usa a
 * tabela de referência pro Aço 1020 nas bitolas comuns, senão a densidade. */
export function calcularMaterial(
  nomeMaterial: string,
  diametroMm: number,
  comprimentoM: number,
  valorPorKg: number,
  densidadeKgM3: number
): ResultadoMaterial {
  const kgPorMetro =
    nomeMaterial === NOME_ACO_1020
      ? calcularKgPorMetro(diametroMm, densidadeKgM3)
      : calcularKgPorMetroPorDensidade(diametroMm, densidadeKgM3);
  const pesoKg = kgPorMetro * comprimentoM;
  const valor = pesoKg * valorPorKg;
  return { kgPorMetro, pesoKg, valor };
}

/** Valor da mão de obra do torno, a partir do tempo de execução. */
export function calcularValorHora(horas: number, minutos: number, valorHora: number): number {
  return (horas + minutos / 60) * valorHora;
}
