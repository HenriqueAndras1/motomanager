import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Switch,
} from "react-native";
import { useState } from "react";
import { useTema } from "../../../src/contextos/tema-contexto";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function TelaNotificacoes() {
  const { cores } = useTema();

  const [alertasAtivos, setAlertasAtivos] = useState(true);
  const [lembretes, setLembretes] = useState(true);

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
            Notificações
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
            Alertas
          </Text>

          <Text
            style={{
              marginTop: 8,
              fontSize: 14,
              color: cores.textoSuave,
            }}
          >
            Controle os avisos do aplicativo.
          </Text>

          <View style={{ marginTop: 20, gap: 16 }}>
            <ItemSwitch
              titulo="Alertas ativos"
              valor={alertasAtivos}
              aoMudar={setAlertasAtivos}
              cores={cores}
            />

            <ItemSwitch
              titulo="Lembretes"
              valor={lembretes}
              aoMudar={setLembretes}
              cores={cores}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ItemSwitch({ titulo, valor, aoMudar, cores }: any) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 16, color: cores.texto }}>{titulo}</Text>

      <Switch
        value={valor}
        onValueChange={aoMudar}
        thumbColor={valor ? cores.primaria : "#ccc"}
      />
    </View>
  );
}