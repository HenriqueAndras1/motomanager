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
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { banco, storage } from "./firebase";
import { Moto } from "../tipos/moto";
import { gerarId } from "../utilitarios/gerar-id";
import {
  buscarMotoSelecionadaId,
  limparMotoSelecionadaId,
} from "./moto-selecionada-firebase";
import { excluirManutencoesPorMotoId } from "./manutencoes-firebase";

const NOME_COLECAO = "motos";

function ehImagemLocal(uri: string): boolean {
  return (
    uri.startsWith("file://") ||
    uri.startsWith("content://") ||
    uri.startsWith("blob:")
  );
}

function obterExtensaoDoArquivo(uri: string): string {
  const uriSemParametros = uri.split("?")[0];
  const partes = uriSemParametros.split(".");
  const extensao = partes[partes.length - 1]?.toLowerCase();

  if (!extensao) {
    return "jpg";
  }

  if (extensao === "jpeg") {
    return "jpg";
  }

  return extensao;
}

function obterContentType(extensao: string): string {
  switch (extensao) {
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "jpg":
    default:
      return "image/jpeg";
  }
}

async function converterUriEmBlob(uri: string): Promise<Blob> {
  const resposta = await fetch(uri);
  return await resposta.blob();
}

async function enviarFotoDaMoto(
  motoId: string,
  fotoUriLocal: string,
): Promise<{ fotoUrl: string; fotoCaminho: string }> {
  const extensao = obterExtensaoDoArquivo(fotoUriLocal);
  const caminho = `motos/${motoId}/foto.${extensao}`;
  const referenciaArquivo = ref(storage, caminho);

  const blob = await converterUriEmBlob(fotoUriLocal);

  await uploadBytes(referenciaArquivo, blob, {
    contentType: obterContentType(extensao),
  });

  const fotoUrl = await getDownloadURL(referenciaArquivo);

  return {
    fotoUrl,
    fotoCaminho: caminho,
  };
}

async function apagarFotoPorCaminho(caminho?: string): Promise<void> {
  if (!caminho) {
    return;
  }

  const referenciaArquivo = ref(storage, caminho);
  await deleteObject(referenciaArquivo);
}

export async function buscarMotos(): Promise<Moto[]> {
  const referenciaColecao = collection(banco, NOME_COLECAO);
  const consulta = query(referenciaColecao, orderBy("atualizadoEm", "desc"));
  const resposta = await getDocs(consulta);

  return resposta.docs.map((item) => item.data() as Moto);
}

export async function existeMotoCadastrada(): Promise<boolean> {
  const motos = await buscarMotos();
  return motos.length > 0;
}

export async function obterMotoPorId(id: string): Promise<Moto | null> {
  const referenciaDocumento = doc(banco, NOME_COLECAO, id);
  const resposta = await getDoc(referenciaDocumento);

  if (!resposta.exists()) {
    return null;
  }

  return resposta.data() as Moto;
}

export async function cadastrarMoto(
  dados: Omit<Moto, "criadoEm" | "atualizadoEm" | "fotoCaminho">,
): Promise<Moto> {
  const agora = new Date().toISOString();

  let fotoFinal = dados.fotoUri;
  let fotoCaminho: string | undefined;

  if (ehImagemLocal(dados.fotoUri)) {
    const upload = await enviarFotoDaMoto(dados.id, dados.fotoUri);
    fotoFinal = upload.fotoUrl;
    fotoCaminho = upload.fotoCaminho;
  }

  const novaMoto: Moto = {
    id: dados.id,
    marca: dados.marca.trim(),
    modelo: dados.modelo.trim(),
    ano: dados.ano,
    cor: dados.cor.trim(),
    quilometragem: dados.quilometragem,
    fotoUri: fotoFinal,
    criadoEm: agora,
    atualizadoEm: agora,
    ...(fotoCaminho ? { fotoCaminho } : {}),
    ...(dados.placa?.trim()
      ? { placa: dados.placa.trim().toUpperCase() }
      : {}),
  };

  const referenciaDocumento = doc(banco, NOME_COLECAO, novaMoto.id);
  await setDoc(referenciaDocumento, novaMoto);

  return novaMoto;
}

type DadosAtualizacaoMoto = {
  marca?: string;
  modelo?: string;
  ano?: number;
  cor?: string;
  quilometragem?: number;
  fotoUri?: string;
  placa?: string;
};

export async function atualizarMoto(
  id: string,
  dados: DadosAtualizacaoMoto,
): Promise<void> {
  const motoAtual = await obterMotoPorId(id);

  if (!motoAtual) {
    throw new Error("Moto não encontrada.");
  }

  let fotoFinal = motoAtual.fotoUri;
  let fotoCaminhoFinal = motoAtual.fotoCaminho;

  if (dados.fotoUri && dados.fotoUri !== motoAtual.fotoUri) {
    if (ehImagemLocal(dados.fotoUri)) {
      if (motoAtual.fotoCaminho) {
        await apagarFotoPorCaminho(motoAtual.fotoCaminho);
      }

      const upload = await enviarFotoDaMoto(id, dados.fotoUri);
      fotoFinal = upload.fotoUrl;
      fotoCaminhoFinal = upload.fotoCaminho;
    } else {
      fotoFinal = dados.fotoUri;
      fotoCaminhoFinal = motoAtual.fotoCaminho;
    }
  }

  const dadosAtualizados: Partial<Moto> = {
    ...(dados.marca !== undefined ? { marca: dados.marca.trim() } : {}),
    ...(dados.modelo !== undefined ? { modelo: dados.modelo.trim() } : {}),
    ...(dados.ano !== undefined ? { ano: dados.ano } : {}),
    ...(dados.cor !== undefined ? { cor: dados.cor.trim() } : {}),
    ...(dados.quilometragem !== undefined
      ? { quilometragem: dados.quilometragem }
      : {}),
    ...(dados.placa !== undefined
      ? dados.placa.trim()
        ? { placa: dados.placa.trim().toUpperCase() }
        : {}
      : {}),
    ...(dados.fotoUri !== undefined
      ? {
          fotoUri: fotoFinal,
          ...(fotoCaminhoFinal ? { fotoCaminho: fotoCaminhoFinal } : {}),
        }
      : {}),
    atualizadoEm: new Date().toISOString(),
  };

  const referenciaDocumento = doc(banco, NOME_COLECAO, id);
  await updateDoc(referenciaDocumento, dadosAtualizados);
}

export async function excluirMoto(id: string): Promise<void> {
  const motoAtual = await obterMotoPorId(id);

  if (!motoAtual) {
    return;
  }

  await excluirManutencoesPorMotoId(id);

  const motoSelecionadaId = await buscarMotoSelecionadaId();

  if (motoSelecionadaId === id) {
    await limparMotoSelecionadaId();
  }

  if (motoAtual.fotoCaminho) {
    await apagarFotoPorCaminho(motoAtual.fotoCaminho);
  }

  const referenciaDocumento = doc(banco, NOME_COLECAO, id);
  await deleteDoc(referenciaDocumento);
}

export function criarIdMoto(): string {
  return gerarId();
}