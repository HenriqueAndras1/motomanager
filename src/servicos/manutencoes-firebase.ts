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
import { Manutencao } from "../tipos/manutencao";
import { atualizarMoto, obterMotoPorId } from "./motos-firebase";

const NOME_COLECAO = "manutencoes";

export async function buscarManutencoesPorMotoId(
  motoId: string,
): Promise<Manutencao[]> {
  const referenciaColecao = collection(banco, NOME_COLECAO);
  const consulta = query(
    referenciaColecao,
    where("motoId", "==", motoId),
    orderBy("data", "desc"),
    orderBy("atualizadoEm", "desc"),
  );

  const resposta = await getDocs(consulta);

  return resposta.docs.map((item) => item.data() as Manutencao);
}

export async function obterManutencaoPorId(
  id: string,
): Promise<Manutencao | null> {
  const referenciaDocumento = doc(banco, NOME_COLECAO, id);
  const resposta = await getDoc(referenciaDocumento);

  if (!resposta.exists()) {
    return null;
  }

  return resposta.data() as Manutencao;
}

export async function obterUltimaManutencaoPorMotoId(
  motoId: string,
): Promise<Manutencao | null> {
  const manutencoes = await buscarManutencoesPorMotoId(motoId);
  return manutencoes[0] ?? null;
}

type DadosCadastroManutencao = {
  motoId: string;
  tipo: string;
  data: string;
  quilometragem: number;
  custo?: number;
  observacao?: string;
};

export async function cadastrarManutencao(
  dados: DadosCadastroManutencao,
): Promise<Manutencao> {
  const moto = await obterMotoPorId(dados.motoId);

  if (!moto) {
    throw new Error("Moto não encontrada.");
  }

  if (dados.quilometragem < moto.quilometragem) {
    throw new Error(
      "A quilometragem da manutenção não pode ser menor que a quilometragem atual da moto.",
    );
  }

  const agora = new Date().toISOString();

  const novaManutencao: Manutencao = {
    id: gerarId(),
    motoId: dados.motoId,
    tipo: dados.tipo.trim(),
    data: dados.data,
    quilometragem: dados.quilometragem,
    criadoEm: agora,
    atualizadoEm: agora,
    ...(dados.custo !== undefined ? { custo: dados.custo } : {}),
    ...(dados.observacao?.trim() ? { observacao: dados.observacao.trim() } : {}),
  };

  const referenciaDocumento = doc(banco, NOME_COLECAO, novaManutencao.id);
  await setDoc(referenciaDocumento, novaManutencao);

  await atualizarMoto(dados.motoId, {
    quilometragem: dados.quilometragem,
  });

  return novaManutencao;
}

type DadosAtualizacaoManutencao = {
  tipo?: string;
  data?: string;
  quilometragem?: number;
  custo?: number;
  observacao?: string;
};

export async function atualizarManutencao(
  id: string,
  dados: DadosAtualizacaoManutencao,
): Promise<void> {
  const manutencaoAtual = await obterManutencaoPorId(id);

  if (!manutencaoAtual) {
    throw new Error("Manutenção não encontrada.");
  }

  const moto = await obterMotoPorId(manutencaoAtual.motoId);

  if (!moto) {
    throw new Error("Moto não encontrada.");
  }

  if (
    dados.quilometragem !== undefined &&
    dados.quilometragem < moto.quilometragem
  ) {
    throw new Error(
      "A quilometragem da manutenção não pode ser menor que a quilometragem atual da moto.",
    );
  }

  const dadosAtualizados: Partial<Manutencao> = {
    ...(dados.tipo !== undefined ? { tipo: dados.tipo.trim() } : {}),
    ...(dados.data !== undefined ? { data: dados.data } : {}),
    ...(dados.quilometragem !== undefined
      ? { quilometragem: dados.quilometragem }
      : {}),
    ...(dados.custo !== undefined ? { custo: dados.custo } : {}),
    ...(dados.observacao !== undefined
      ? dados.observacao.trim()
        ? { observacao: dados.observacao.trim() }
        : {}
      : {}),
    atualizadoEm: new Date().toISOString(),
  };

  const referenciaDocumento = doc(banco, NOME_COLECAO, id);
  await updateDoc(referenciaDocumento, dadosAtualizados);

  if (dados.quilometragem !== undefined) {
    await atualizarMoto(manutencaoAtual.motoId, {
      quilometragem: dados.quilometragem,
    });
  }
}

export async function excluirManutencao(id: string): Promise<void> {
  const referenciaDocumento = doc(banco, NOME_COLECAO, id);
  await deleteDoc(referenciaDocumento);
}