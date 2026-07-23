import { describe, expect, it } from "vitest";
import { calcularStatusExtra } from "./extras";

describe("calcularStatusExtra", () => {
  it("fica pendente sem nenhum pagamento", () => {
    const r = calcularStatusExtra(400, 90, 0, []);
    expect(r.totalPago).toBe(0);
    expect(r.saldo).toBe(90);
    expect(r.status).toBe("pendente");
  });

  it("fica parcialmente pago com pagamento parcial", () => {
    const r = calcularStatusExtra(400, 90, 0, [{ valor: 40 }]);
    expect(r.saldo).toBe(50);
    expect(r.status).toBe("parcialmente_pago");
  });

  it("fica pago quando o pagamento cobre o extra inteiro", () => {
    const r = calcularStatusExtra(400, 90, 0, [{ valor: 90 }]);
    expect(r.saldo).toBe(0);
    expect(r.status).toBe("pago");
  });

  it("calcula o lucro da empresa descontando extra e outros custos", () => {
    const r = calcularStatusExtra(400, 90, 20, []);
    expect(r.lucroEmpresa).toBe(290);
  });

  it("lucro da empresa pode ficar negativo (extra + custos maior que o serviço)", () => {
    const r = calcularStatusExtra(100, 90, 30, []);
    expect(r.lucroEmpresa).toBe(-20);
  });

  it("não deixa o saldo ficar negativo se pagar a mais que o combinado", () => {
    const r = calcularStatusExtra(400, 90, 0, [{ valor: 150 }]);
    expect(r.saldo).toBe(0);
    expect(r.status).toBe("pago");
  });
});
