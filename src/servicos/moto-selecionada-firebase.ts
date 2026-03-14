import { deleteField, doc, getDoc, setDoc } from "firebase/firestore";
import { banco } from "./firebase";

const NOME_COLECAO = "configuracoes";
const ID_DOCUMENTO = "estado-app";

type EstadoApp = {
  motoSelecionadaId?: string;
};

export async function buscarMotoSelecionadaId(): Promise<string | null> {
  const referenciaDocumento = doc(banco, NOME_COLECAO, ID_DOCUMENTO);
  const resposta = await getDoc(referenciaDocumento);

  if (!resposta.exists()) {
    return null;
  }

  const dados = resposta.data() as EstadoApp;

  if (!dados.motoSelecionadaId) {
    return null;
  }

  return dados.motoSelecionadaId;
}

export async function salvarMotoSelecionadaId(
  motoSelecionadaId: string,
): Promise<void> {
  const referenciaDocumento = doc(banco, NOME_COLECAO, ID_DOCUMENTO);

  await setDoc(
    referenciaDocumento,
    {
      motoSelecionadaId,
    },
    { merge: true },
  );
}

export async function limparMotoSelecionadaId(): Promise<void> {
  const referenciaDocumento = doc(banco, NOME_COLECAO, ID_DOCUMENTO);

  await setDoc(
    referenciaDocumento,
    {
      motoSelecionadaId: deleteField(),
    },
    { merge: true },
  );
}