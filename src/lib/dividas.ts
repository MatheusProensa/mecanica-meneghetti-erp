export type SituacaoDivida = "em_aberto" | "pagando" | "quitado";

export interface ResumoDivida {
  totalPago: number;
  saldo: number;
  situacao: SituacaoDivida;
}

/** Situação e saldo são sempre derivados da soma dos pagamentos — nunca guardados
 * diretamente, pra não correr o risco de ficarem dessincronizados. */
export function calcularSituacaoDivida(
  valorOriginal: number,
  pagamentos: { valor: number }[]
): ResumoDivida {
  const totalPago = pagamentos.reduce((s, p) => s + p.valor, 0);
  const saldo = Math.max(0, valorOriginal - totalPago);
  const situacao: SituacaoDivida = saldo <= 0.005 ? "quitado" : totalPago > 0 ? "pagando" : "em_aberto";
  return { totalPago, saldo, situacao };
}
