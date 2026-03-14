import { PeriodoUso } from "../tipos/alerta";

export function calcularQuilometragemFaltante(
  quilometragemAtual: number,
  quilometragemObjetivo: number,
): number {
  return Math.max(quilometragemObjetivo - quilometragemAtual, 0);
}

export function calcularKmPorDia(
  usoMedioValor: number,
  usoMedioPeriodo: PeriodoUso,
): number {
  if (usoMedioPeriodo === "dia") {
    return usoMedioValor;
  }

  if (usoMedioPeriodo === "semana") {
    return usoMedioValor / 7;
  }

  return usoMedioValor / 30;
}

export function calcularDataPrevista(
  quilometragemAtual: number,
  quilometragemObjetivo: number,
  usoMedioValor: number,
  usoMedioPeriodo: PeriodoUso,
): string | null {
  const faltante = calcularQuilometragemFaltante(
    quilometragemAtual,
    quilometragemObjetivo,
  );

  const kmPorDia = calcularKmPorDia(usoMedioValor, usoMedioPeriodo);

  if (kmPorDia <= 0 || faltante <= 0) {
    return null;
  }

  const dias = Math.ceil(faltante / kmPorDia);
  const data = new Date();
  data.setDate(data.getDate() + dias);

  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}