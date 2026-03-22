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

// 🔥 NOVOS IMPORTS
import * as Application from "expo-application";
import * as Updates from "expo-updates";

export default function TelaSobre() {
  const { cores } = useTema();

  // 🔥 VERSÃO REAL DO APP
  const versao = Application.nativeApplicationVersion || "1.0.0";

  // 🔥 ID DA ATUALIZAÇÃO OTA
  const updateId = Updates.updateId?.slice(0, 8) || "original";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: cores.fundo }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 56,
          paddingBottom: 24,
        }}
      >
        {/* HEADER */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => router.replace("/configuracoes")}
            style={{ position: "absolute", left: 0, padding: 8 }}
          >
            <Ionicons name="chevron-back" size={24} color={cores.texto} />
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
        </View>

        {/* CARD */}
        <View
          style={{
            marginTop: 32,
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

          {/* 🔥 VERSÃO DINÂMICA */}
          <Text
            style={{
              marginTop: 8,
              fontSize: 14,
              color: cores.textoSuave,
            }}
          >
            Versão {versao}
          </Text>

          {/* 🔥 OTA VISÍVEL */}
          <Text
            style={{
              marginTop: 4,
              fontSize: 12,
              color: cores.textoSecundario,
            }}
          >
            Atualização {updateId}
          </Text>

          <Text
            style={{
              marginTop: 16,
              fontSize: 14,
              color: cores.textoSecundario,
            }}
          >
            Aplicativo para gerenciamento de motos, manutenções e alertas.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}