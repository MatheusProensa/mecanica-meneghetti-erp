import { describe, expect, it } from "vitest";
import { calcularSituacaoDivida, dataMaisAntigaItem } from "./dividas";

describe("calcularSituacaoDivida", () => {
  it("fica em aberto quando não tem nenhum pagamento", () => {
    const r = calcularSituacaoDivida([{ valor: 300 }], []);
    expect(r).toEqual({ valorOriginal: 300, totalPago: 0, saldo: 300, situacao: "em_aberto" });
  });

  it("fica pagando quando tem pagamento parcial", () => {
    const r = calcularSituacaoDivida([{ valor: 300 }], [{ valor: 100 }]);
    expect(r).toEqual({ valorOriginal: 300, totalPago: 100, saldo: 200, situacao: "pagando" });
  });

  it("fica quitado quando o pagamento cobre o valor exato", () => {
    const r = calcularSituacaoDivida([{ valor: 300 }], [{ valor: 300 }]);
    expect(r.situacao).toBe("quitado");
    expect(r.saldo).toBe(0);
  });

  it("soma vários itens e vários pagamentos", () => {
    const r = calcularSituacaoDivida(
      [{ valor: 100 }, { valor: 200 }, { valor: 50 }],
      [{ valor: 80 }, { valor: 20 }]
    );
    expect(r.valorOriginal).toBe(350);
    expect(r.totalPago).toBe(100);
    expect(r.saldo).toBe(250);
    expect(r.situacao).toBe("pagando");
  });

  it("não deixa o saldo ficar negativo se pagar a mais", () => {
    const r = calcularSituacaoDivida([{ valor: 100 }], [{ valor: 150 }]);
    expect(r.saldo).toBe(0);
    expect(r.situacao).toBe("quitado");
  });

  it("considera quitado com diferença de centavo por arredondamento de ponto flutuante", () => {
    // 0.1 + 0.2 não é exatamente 0.3 em ponto flutuante — é exatamente esse
    // tipo de caso que a margem de 0.005 no cálculo existe pra cobrir.
    const r = calcularSituacaoDivida([{ valor: 0.3 }], [{ valor: 0.1 }, { valor: 0.2 }]);
    expect(r.situacao).toBe("quitado");
  });

  it("dívida sem nenhum item soma zero", () => {
    const r = calcularSituacaoDivida([], []);
    expect(r).toEqual({ valorOriginal: 0, totalPago: 0, saldo: 0, situacao: "quitado" });
  });
});

describe("dataMaisAntigaItem", () => {
  it("retorna null quando não tem itens", () => {
    expect(dataMaisAntigaItem([])).toBeNull();
  });

  it("acha a data mais antiga entre vários itens", () => {
    const antiga = new Date("2026-01-10");
    const meio = new Date("2026-03-05");
    const recente = new Date("2026-07-20");
    expect(dataMaisAntigaItem([{ data: recente }, { data: antiga }, { data: meio }])).toBe(antiga);
  });
});
