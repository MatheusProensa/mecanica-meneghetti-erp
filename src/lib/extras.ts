export type StatusExtra = "pendente" | "parcialmente_pago" | "pago";

export interface ResumoExtra {
  totalPago: number;
  saldo: number;
  status: StatusExtra;
  lucroEmpresa: number;
}

/** Status e saldo são sempre derivados da soma dos pagamentos — nunca guardados
 * diretamente, pra não correr o risco de ficarem dessincronizados. */
export function calcularStatusExtra(
  valorServico: number,
  valorExtra: number,
  outrosCustos: number,
  pagamentos: { valor: number }[]
): ResumoExtra {
  const totalPago = pagamentos.reduce((s, p) => s + p.valor, 0);
  const saldo = Math.max(0, valorExtra - totalPago);
  const status: StatusExtra =
    saldo <= 0.005 ? "pago" : totalPago > 0 ? "parcialmente_pago" : "pendente";
  const lucroEmpresa = valorServico - valorExtra - outrosCustos;
  return { totalPago, saldo, status, lucroEmpresa };
}
