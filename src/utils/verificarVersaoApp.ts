import * as Application from "expo-application";

export async function verificarVersaoApp(setBloqueado: (v: boolean) => void) {
  try {
    const versaoAtual = Application.nativeApplicationVersion || "1.0.0";

    const response = await fetch("https://seu-json/version.json");
    const data = await response.json();

    if (data.forceUpdate && versaoAtual !== data.minVersion) {
      setBloqueado(true);
    }
  } catch (e) {
    console.log("Erro versão:", e);
  }
}