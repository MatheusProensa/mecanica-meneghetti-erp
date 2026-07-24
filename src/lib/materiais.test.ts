import { describe, expect, it } from "vitest";
import { calcularKgPorMetro, calcularMaterial, calcularValorHora } from "./materiais";

describe("calcularValorHora", () => {
  it("30 minutos = metade do valor da hora", () => {
    expect(calcularValorHora(0, 30, 120)).toBe(60);
  });

  it("1 hora = valor cheio da hora", () => {
    expect(calcularValorHora(1, 0, 120)).toBe(120);
  });

  it("1h30 = 1.5x o valor da hora", () => {
    expect(calcularValorHora(1, 30, 120)).toBe(180);
  });

  it("2h15", () => {
    expect(calcularValorHora(2, 15, 120)).toBe(270);
  });
});

describe("calcularKgPorMetro", () => {
  it("usa o valor da tabela pra bitolas conhecidas", () => {
    expect(calcularKgPorMetro(25)).toBe(3.85);
    expect(calcularKgPorMetro(100)).toBe(61.65);
  });

  it("usa a fórmula Ø²/162 pra bitolas fora da tabela", () => {
    expect(calcularKgPorMetro(20)).toBeCloseTo((20 * 20) / 162, 5);
  });
});

describe("calcularMaterial", () => {
  it("calcula peso e valor pra uma barra de 25mm com 2 metros", () => {
    const r = calcularMaterial(25, 2, 11);
    expect(r.kgPorMetro).toBe(3.85);
    expect(r.pesoKg).toBeCloseTo(7.7, 5);
    expect(r.valor).toBeCloseTo(84.7, 5);
  });
});
