/** Tabela de referência kg/m de barra redonda de aço, por diâmetro — valores
 * de tabela oficial, mais precisos que a fórmula pura pra bitolas comuns. */
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

/** kg/m de uma barra redonda de aço, pro diâmetro informado — usa a tabela de
 * referência quando o diâmetro bate com uma bitola comum, senão calcula pela
 * fórmula padrão (Ø² ÷ 162). */
export function calcularKgPorMetro(diametroMm: number): number {
  const daTabela = TABELA_BARRA_REDONDA.find((b) => b.diametroMm === diametroMm);
  if (daTabela) return daTabela.kgPorMetro;
  return (diametroMm * diametroMm) / 162;
}

export interface ResultadoMaterial {
  kgPorMetro: number;
  pesoKg: number;
  valor: number;
}

/** Peso e custo do material usado — comprimento sempre em metros. */
export function calcularMaterial(
  diametroMm: number,
  comprimentoM: number,
  valorPorKg: number
): ResultadoMaterial {
  const kgPorMetro = calcularKgPorMetro(diametroMm);
  const pesoKg = kgPorMetro * comprimentoM;
  const valor = pesoKg * valorPorKg;
  return { kgPorMetro, pesoKg, valor };
}

/** Valor da mão de obra do torno, a partir do tempo de execução. */
export function calcularValorHora(horas: number, minutos: number, valorHora: number): number {
  return (horas + minutos / 60) * valorHora;
}
