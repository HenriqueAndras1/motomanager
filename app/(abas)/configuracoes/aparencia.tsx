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

export default function TelaAparencia() {
  const { tema, cores, definirTema } = useTema();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: cores.fundo }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 56,
          paddingBottom: 24,
        }}
      >
        {/* HEADER COM VOLTAR */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TouchableOpacity
            onPress={() => router.replace("/configuracoes")}
            style={{
              position: "absolute",
              left: 0,
              padding: 8,
            }}
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={cores.texto}
            />
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 28,
              fontWeight: "700",
              color: cores.texto,
            }}
          >
            Aparência
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
            Tema
          </Text>

          <Text
            style={{
              marginTop: 8,
              fontSize: 14,
              color: cores.textoSuave,
            }}
          >
            Escolha o tema visual do aplicativo.
          </Text>

          <View style={{ marginTop: 20, gap: 12 }}>
            <BotaoTema
              titulo="Tema claro"
              icone="sunny-outline"
              selecionado={tema === "claro"}
              aoPressionar={() => {
                void definirTema("claro");
              }}
              cores={cores}
            />

            <BotaoTema
              titulo="Tema escuro"
              icone="moon-outline"
              selecionado={tema === "escuro"}
              aoPressionar={() => {
                void definirTema("escuro");
              }}
              cores={cores}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type BotaoTemaProps = {
  titulo: string;
  icone: keyof typeof Ionicons.glyphMap;
  selecionado: boolean;
  aoPressionar: () => void;
  cores: any;
};

function BotaoTema({
  titulo,
  icone,
  selecionado,
  aoPressionar,
  cores,
}: BotaoTemaProps) {
  return (
    <TouchableOpacity
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: selecionado ? cores.primaria : cores.borda,
        backgroundColor: cores.fundo,
        paddingHorizontal: 16,
        paddingVertical: 16,
      }}
      activeOpacity={0.8}
      onPress={aoPressionar}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Ionicons
          name={icone}
          size={20}
          color={selecionado ? cores.primaria : cores.texto}
        />
        <Text
          style={{
            marginLeft: 12,
            fontSize: 16,
            fontWeight: "500",
            color: cores.texto,
          }}
        >
          {titulo}
        </Text>
      </View>

      <View
        style={{
          height: 20,
          width: 20,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 999,
          borderWidth: 2,
          borderColor: selecionado ? cores.primaria : cores.textoSuave,
        }}
      >
        {selecionado ? (
          <View
            style={{
              height: 10,
              width: 10,
              borderRadius: 999,
              backgroundColor: cores.primaria,
            }}
          />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}