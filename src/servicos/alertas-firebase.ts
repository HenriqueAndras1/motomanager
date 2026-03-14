import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { banco } from "./firebase";
import { gerarId } from "../utilitarios/gerar-id";
import { Alerta, PeriodoUso } from "../tipos/alerta";

const NOME_COLECAO = "alertas";

function calcularQuilometragemFaltante(
  quilometragemAtual: number,
  quilometragemObjetivo: number,
): number {
  return Math.max(quilometragemObjetivo - quilometragemAtual, 0);
}

function calcularKmPorDia(
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

function calcularDataPrevista(
  quilometragemAtual: number,
  quilometragemObjetivo: number,
  usoMedioValor: number,
  usoMedioPeriodo: PeriodoUso,
): string | undefined {
  const faltante = calcularQuilometragemFaltante(
    quilometragemAtual,
    quilometragemObjetivo,
  );

  const kmPorDia = calcularKmPorDia(usoMedioValor, usoMedioPeriodo);

  if (faltante <= 0 || kmPorDia <= 0) {
    return undefined;
  }

  const dias = Math.ceil(faltante / kmPorDia);
  const data = new Date();
  data.setDate(data.getDate() + dias);

  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

type DadosCadastroAlertaBase = {
  motoId: string;
  titulo: string;
  observacao?: string;
  ativo?: boolean;
};

type DadosCadastroAlertaKm = DadosCadastroAlertaBase & {
  tipo: "manutencao_km";
  quilometragemAtual: number;
  quilometragemObjetivo: number;
  usoMedioValor: number;
  usoMedioPeriodo: PeriodoUso;
};

type DadosCadastroAlertaData = DadosCadastroAlertaBase & {
  tipo: "data";
  dataAlvo: string;
};

export type DadosCadastroAlerta =
  | DadosCadastroAlertaKm
  | DadosCadastroAlertaData;

type DadosAtualizacaoAlertaBase = {
  titulo?: string;
  observacao?: string;
  ativo?: boolean;
};

type DadosAtualizacaoAlertaKm = DadosAtualizacaoAlertaBase & {
  tipo?: "manutencao_km";
  quilometragemAtual?: number;
  quilometragemObjetivo?: number;
  usoMedioValor?: number;
  usoMedioPeriodo?: PeriodoUso;
};

type DadosAtualizacaoAlertaData = DadosAtualizacaoAlertaBase & {
  tipo?: "data";
  dataAlvo?: string;
};

export type DadosAtualizacaoAlerta =
  | DadosAtualizacaoAlertaKm
  | DadosAtualizacaoAlertaData;

export async function buscarAlertasPorMotoId(
  motoId: string,
): Promise<Alerta[]> {
  const referenciaColecao = collection(banco, NOME_COLECAO);
  const consulta = query(
    referenciaColecao,
    where("motoId", "==", motoId),
    orderBy("ativo", "desc"),
    orderBy("atualizadoEm", "desc"),
  );

  const resposta = await getDocs(consulta);

  return resposta.docs.map((item) => item.data() as Alerta);
}

export async function buscarAlertasAtivosPorMotoId(
  motoId: string,
): Promise<Alerta[]> {
  const alertas = await buscarAlertasPorMotoId(motoId);
  return alertas.filter((alerta) => alerta.ativo && !alerta.concluido);
}

export async function buscarHistoricoAlertasPorMotoId(
  motoId: string,
): Promise<Alerta[]> {
  const alertas = await buscarAlertasPorMotoId(motoId);
  return alertas.filter((alerta) => alerta.concluido || !alerta.ativo);
}

export async function obterAlertaPorId(id: string): Promise<Alerta | null> {
  const referenciaDocumento = doc(banco, NOME_COLECAO, id);
  const resposta = await getDoc(referenciaDocumento);

  if (!resposta.exists()) {
    return null;
  }

  return resposta.data() as Alerta;
}

export async function cadastrarAlerta(
  dados: DadosCadastroAlerta,
): Promise<Alerta> {
  const agora = new Date().toISOString();

  if (dados.tipo === "manutencao_km") {
    const quilometragemFaltante = calcularQuilometragemFaltante(
      dados.quilometragemAtual,
      dados.quilometragemObjetivo,
    );

    const dataPrevista = calcularDataPrevista(
      dados.quilometragemAtual,
      dados.quilometragemObjetivo,
      dados.usoMedioValor,
      dados.usoMedioPeriodo,
    );

    const novoAlerta: Alerta = {
      id: gerarId(),
      motoId: dados.motoId,
      titulo: dados.titulo.trim(),
      tipo: "manutencao_km",
      ativo: dados.ativo ?? true,
      concluido: false,
      criadoEm: agora,
      atualizadoEm: agora,
      quilometragemAtual: dados.quilometragemAtual,
      quilometragemObjetivo: dados.quilometragemObjetivo,
      usoMedioValor: dados.usoMedioValor,
      usoMedioPeriodo: dados.usoMedioPeriodo,
      quilometragemFaltante,
      ...(dataPrevista ? { dataPrevista } : {}),
      ...(dados.observacao?.trim()
        ? { observacao: dados.observacao.trim() }
        : {}),
    };

    const referenciaDocumento = doc(banco, NOME_COLECAO, novoAlerta.id);
    await setDoc(referenciaDocumento, novoAlerta);

    return novoAlerta;
  }

  const novoAlerta: Alerta = {
    id: gerarId(),
    motoId: dados.motoId,
    titulo: dados.titulo.trim(),
    tipo: "data",
    ativo: dados.ativo ?? true,
    concluido: false,
    criadoEm: agora,
    atualizadoEm: agora,
    dataAlvo: dados.dataAlvo,
    ...(dados.observacao?.trim() ? { observacao: dados.observacao.trim() } : {}),
  };

  const referenciaDocumento = doc(banco, NOME_COLECAO, novoAlerta.id);
  await setDoc(referenciaDocumento, novoAlerta);

  return novoAlerta;
}

export async function atualizarAlerta(
  id: string,
  dados: DadosAtualizacaoAlerta,
): Promise<void> {
  const alertaAtual = await obterAlertaPorId(id);

  if (!alertaAtual) {
    throw new Error("Alerta não encontrado.");
  }

  const dadosAtualizados: Partial<Alerta> = {
    ...(dados.titulo !== undefined ? { titulo: dados.titulo.trim() } : {}),
    ...(dados.ativo !== undefined ? { ativo: dados.ativo } : {}),
    ...(dados.observacao !== undefined
      ? dados.observacao.trim()
        ? { observacao: dados.observacao.trim() }
        : {}
      : {}),
    atualizadoEm: new Date().toISOString(),
  };

  const tipoFinal = dados.tipo ?? alertaAtual.tipo;

  if (tipoFinal === "manutencao_km") {
    const quilometragemAtual =
      "quilometragemAtual" in dados && dados.quilometragemAtual !== undefined
        ? dados.quilometragemAtual
        : alertaAtual.quilometragemAtual ?? 0;

    const quilometragemObjetivo =
      "quilometragemObjetivo" in dados &&
      dados.quilometragemObjetivo !== undefined
        ? dados.quilometragemObjetivo
        : alertaAtual.quilometragemObjetivo ?? 0;

    const usoMedioValor =
      "usoMedioValor" in dados && dados.usoMedioValor !== undefined
        ? dados.usoMedioValor
        : alertaAtual.usoMedioValor ?? 0;

    const usoMedioPeriodo =
      "usoMedioPeriodo" in dados && dados.usoMedioPeriodo !== undefined
        ? dados.usoMedioPeriodo
        : alertaAtual.usoMedioPeriodo ?? "semana";

    const quilometragemFaltante = calcularQuilometragemFaltante(
      quilometragemAtual,
      quilometragemObjetivo,
    );

    const dataPrevista = calcularDataPrevista(
      quilometragemAtual,
      quilometragemObjetivo,
      usoMedioValor,
      usoMedioPeriodo,
    );

    Object.assign(dadosAtualizados, {
      tipo: "manutencao_km" as const,
      quilometragemAtual,
      quilometragemObjetivo,
      usoMedioValor,
      usoMedioPeriodo,
      quilometragemFaltante,
      ...(dataPrevista ? { dataPrevista } : {}),
    });
  }

  if (tipoFinal === "data") {
    const dataAlvo =
      "dataAlvo" in dados && dados.dataAlvo !== undefined
        ? dados.dataAlvo
        : alertaAtual.dataAlvo;

    Object.assign(dadosAtualizados, {
      tipo: "data" as const,
      ...(dataAlvo ? { dataAlvo } : {}),
    });
  }

  const referenciaDocumento = doc(banco, NOME_COLECAO, id);
  await updateDoc(referenciaDocumento, dadosAtualizados);
}

export async function concluirAlerta(id: string): Promise<void> {
  const referenciaDocumento = doc(banco, NOME_COLECAO, id);

  await updateDoc(referenciaDocumento, {
    ativo: false,
    concluido: true,
    concluidoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  });
}

export async function reativarAlerta(id: string): Promise<void> {
  const referenciaDocumento = doc(banco, NOME_COLECAO, id);

  await updateDoc(referenciaDocumento, {
    ativo: true,
    concluido: false,
    atualizadoEm: new Date().toISOString(),
  });
}

export async function excluirAlerta(id: string): Promise<void> {
  const referenciaDocumento = doc(banco, NOME_COLECAO, id);
  await deleteDoc(referenciaDocumento);
}

export async function excluirAlertasPorMotoId(motoId: string): Promise<void> {
  const alertas = await buscarAlertasPorMotoId(motoId);

  await Promise.all(
    alertas.map((alerta) => {
      const referenciaDocumento = doc(banco, NOME_COLECAO, alerta.id);
      return deleteDoc(referenciaDocumento);
    }),
  );
}