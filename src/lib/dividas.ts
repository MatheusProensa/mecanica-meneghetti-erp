export type SituacaoDivida = "em_aberto" | "pagando" | "quitado";

export interface ResumoDivida {
  valorOriginal: number;
  totalPago: number;
  saldo: number;
  situacao: SituacaoDivida;
}

/** Valor original, situação e saldo são sempre derivados da soma dos itens e
 * dos pagamentos — nunca guardados diretamente, pra não correr o risco de
 * ficarem dessincronizados. */
export function calcularSituacaoDivida(
  itens: { valor: number }[],
  pagamentos: { valor: number }[]
): ResumoDivida {
  const valorOriginal = itens.reduce((s, i) => s + i.valor, 0);
  const totalPago = pagamentos.reduce((s, p) => s + p.valor, 0);
  const saldo = Math.max(0, valorOriginal - totalPago);
  const situacao: SituacaoDivida = saldo <= 0.005 ? "quitado" : totalPago > 0 ? "pagando" : "em_aberto";
  return { valorOriginal, totalPago, saldo, situacao };
}

/** Data do item mais antigo — usada como referência de "data do serviço"
 * nas listagens, já que cada dívida agora pode ter vários itens em datas
 * diferentes. */
export function dataMaisAntigaItem(itens: { data: Date }[]): Date | null {
  if (itens.length === 0) return null;
  return itens.reduce((min, i) => (i.data < min ? i.data : min), itens[0].data);
}
