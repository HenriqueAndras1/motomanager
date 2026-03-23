import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { useTema } from "../../../src/contextos/tema-contexto";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import * as Application from "expo-application";
import * as Updates from "expo-updates";

export default function TelaSobre() {
  const { cores } = useTema();

  // 🔥 versão do app
  const versao = Application.nativeApplicationVersion || "1.0.0";

  const build = Application.nativeBuildVersion || "1";

  const otaVersao = Updates.createdAt
    ? new Date(Updates.createdAt).getTime().toString().slice(-4)
    : null;

  const versaoFinal = otaVersao
    ? `v${versao} (${build}.${otaVersao})`
    : `v${versao} (${build})`;

  const dataAtualizacao = Updates.createdAt
    ? new Date(Updates.createdAt).toLocaleDateString("pt-BR")
    : new Date().toLocaleDateString("pt-BR");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: cores.fundo }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 56,
          paddingBottom: 24,
        }}
      >
        {/* 🔥 HEADER PADRÃO */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
          }}
        >
          <TouchableOpacity
            style={{
              height: 40,
              width: 40,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 999,
              backgroundColor: cores.fundoCard,
            }}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={22} color={cores.texto} />
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: cores.texto,
            }}
          >
            Sobre
          </Text>

          {/* 🔥 espaço pra centralizar */}
          <View style={{ height: 40, width: 40 }} />
        </View>

        {/* CARD */}
        <View
          style={{
            marginTop: 8,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: cores.borda,
            backgroundColor: cores.fundoCard,
            padding: 20,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: cores.texto,
            }}
          >
            Moto Manager
          </Text>

          <Text
            style={{
              marginTop: 8,
              fontSize: 14,
              color: cores.textoSuave,
            }}
          >
            {versaoFinal}
          </Text>

          {/* 🔥 DATA */}
          <Text
            style={{
              marginTop: 2,
              fontSize: 12,
              color: cores.textoSecundario,
            }}
          >
            Atualizado em {dataAtualizacao}
          </Text>

          <Text
            style={{
              marginTop: 16,
              fontSize: 14,
              color: cores.textoSecundario,
            }}
          >
            Aplicativo Para Gerenciamento de Motos, Manutenções e Alertas.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}