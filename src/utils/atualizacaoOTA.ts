import * as Updates from "expo-updates";

let jaVerificou = false;

// 🔥 MODO DEBUG (força mostrar loading)
const DEBUG_OTA = false;

type Params = {
  setUpdateDisponivel: (value: boolean) => void;
  setObrigatorio: (value: boolean) => void;
  setAtualizando: (value: boolean) => void;
  setProgresso: (value: number) => void;
  setMensagem: (value: string) => void;
};

export async function verificarAtualizacaoOTA({
  setUpdateDisponivel,
  setObrigatorio,
  setAtualizando,
  setProgresso,
  setMensagem,
}: Params) {
  if (jaVerificou && !DEBUG_OTA) return;
  jaVerificou = true;

  try {
    setMensagem("Verificando atualização...");

    const update = await Updates.checkForUpdateAsync();

    console.log("Update disponível:", update.isAvailable);

    // 🔥 FORÇA ENTRAR NO FLOW EM DEBUG
    if (update.isAvailable || DEBUG_OTA) {
      setAtualizando(true);
      setMensagem("Baixando atualização...");

      let progressoFake = 0;

      const interval = setInterval(() => {
        progressoFake += Math.random() * 12;

        if (progressoFake >= 90) {
          progressoFake = 90;
          clearInterval(interval);
        }

        setProgresso(Math.floor(progressoFake));
      }, 300);

      // 🔥 GARANTE MÍNIMO 3s VISÍVEL
      const delayMinimo = new Promise((resolve) =>
        setTimeout(resolve, 3000)
      );

      await Promise.all([
        Updates.fetchUpdateAsync(),
        delayMinimo,
      ]);

      clearInterval(interval);
      setProgresso(100);

      setMensagem("Aplicando atualização...");

      const obrigatorio = true;

      setObrigatorio(obrigatorio);
      setUpdateDisponivel(true);

      // 🔥 delay final pra UX
      await new Promise((resolve) => setTimeout(resolve, 800));

      await Updates.reloadAsync();
    }
  } catch (error) {
    console.log("Erro OTA:", error);
  }
}