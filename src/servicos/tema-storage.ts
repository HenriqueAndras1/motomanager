import AsyncStorage from "@react-native-async-storage/async-storage";
import { NomeTema } from "../temas/tema";

const CHAVE_TEMA = "@moto_manager:tema";

export async function salvarTema(nomeTema: NomeTema): Promise<void> {
  await AsyncStorage.setItem(CHAVE_TEMA, nomeTema);
}

export async function buscarTemaSalvo(): Promise<NomeTema | null> {
  const valor = await AsyncStorage.getItem(CHAVE_TEMA);

  if (valor === "claro" || valor === "escuro") {
    return valor;
  }

  return null;
}