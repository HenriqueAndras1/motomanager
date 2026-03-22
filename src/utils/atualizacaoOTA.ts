import * as Updates from "expo-updates";

let jaVerificou = false;

type Params = {
  setUpdateDisponivel: (value: boolean) => void;
  setObrigatorio: (value: boolean) => void;
};

export async function verificarAtualizacaoOTA({
  setUpdateDisponivel,
  setObrigatorio,
}: Params) {
  if (jaVerificou) return;
  jaVerificou = true;

  try {
    const update = await Updates.checkForUpdateAsync();

    if (update.isAvailable) {
      await Updates.fetchUpdateAsync();

      // 🔒 FORÇANDO atualização obrigatória
      const obrigatorio = true;

      setObrigatorio(obrigatorio);
      setUpdateDisponivel(true);
    }
  } catch (error) {
    console.log("Erro OTA:", error);
  }
}