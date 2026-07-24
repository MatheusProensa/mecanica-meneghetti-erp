import { describe, expect, it } from "vitest";
import {
  calcularKgPorMetro,
  calcularKgPorMetroPorDensidade,
  calcularMaterial,
  calcularValorHora,
} from "./materiais";

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

describe("calcularKgPorMetroPorDensidade", () => {
  it("Aço 1020 (7850 kg/m³) num diâmetro de 50mm bate com a tabela de referência", () => {
    // Ligeira diferença de arredondamento em relação à tabela oficial (15.42) é esperada.
    expect(calcularKgPorMetroPorDensidade(50, 7850)).toBeCloseTo(15.42, 1);
  });

  it("material mais leve (nylon) pesa proporcionalmente menos que o aço", () => {
    const acoKgM = calcularKgPorMetroPorDensidade(50, 7850);
    const nylonKgM = calcularKgPorMetroPorDensidade(50, 1140);
    expect(nylonKgM).toBeLessThan(acoKgM);
  });
});

describe("calcularKgPorMetro (Aço 1020)", () => {
  it("usa o valor da tabela pra bitolas conhecidas", () => {
    expect(calcularKgPorMetro(25)).toBe(3.85);
    expect(calcularKgPorMetro(100)).toBe(61.65);
  });

  it("usa a densidade pra bitolas fora da tabela", () => {
    expect(calcularKgPorMetro(20)).toBeCloseTo(calcularKgPorMetroPorDensidade(20, 7850), 5);
  });
});

describe("calcularMaterial", () => {
  it("Aço 1020, Ø50mm, 0,50m — bate com o exemplo dado (7,71kg / R$154,20)", () => {
    const r = calcularMaterial("Aço 1020", 50, 0.5, 20, 7850);
    expect(r.pesoKg).toBeCloseTo(7.71, 2);
    expect(r.valor).toBeCloseTo(154.2, 0);
  });

  it("calcula peso e valor pra uma barra de Aço 1020 de 25mm com 2 metros", () => {
    const r = calcularMaterial("Aço 1020", 25, 2, 11, 7850);
    expect(r.kgPorMetro).toBe(3.85);
    expect(r.pesoKg).toBeCloseTo(7.7, 5);
    expect(r.valor).toBeCloseTo(84.7, 5);
  });

  it("outro material (não Aço 1020) usa a densidade direto, sem tabela", () => {
    const r = calcularMaterial("Alumínio", 50, 1, 80, 2700);
    expect(r.kgPorMetro).toBeCloseTo(calcularKgPorMetroPorDensidade(50, 2700), 5);
  });
});
