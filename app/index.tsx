import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, Text, View } from "react-native";
import { existeMotoCadastrada } from "../src/servicos/motos-firebase";

export default function TelaInicial() {
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function verificarCadastro(): Promise<void> {
      try {
        const temMotoCadastrada = await existeMotoCadastrada();

        if (temMotoCadastrada) {
          router.replace("/(abas)/moto");
        } else {
          router.replace("/cadastro");
        }
      } finally {
        setCarregando(false);
      }
    }

    verificarCadastro();
  }, []);

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-slate-950 px-6">
      <View className="items-center">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="mt-4 text-base text-slate-300">
          Carregando aplicativo...
        </Text>
        {!carregando ? (
          <Text className="mt-2 text-sm text-slate-500">Redirecionando...</Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}