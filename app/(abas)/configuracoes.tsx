import { ActivityIndicator, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTema } from "../../src/contextos/tema-contexto";

export default function TelaConfiguracoes() {
  const { tema, cores, definirTema, carregandoTema } = useTema();

  if (carregandoTema) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: cores.fundo,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={cores.primaria} />
        <Text
          style={{
            marginTop: 16,
            fontSize: 16,
            color: cores.textoSecundario,
          }}
        >
          Carregando configurações...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: cores.fundo }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 56,
          paddingBottom: 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Text
            style={{
              textAlign: "center",
              fontSize: 30,
              fontWeight: "700",
              color: cores.texto,
            }}
          >
            Configurações
          </Text>
        </View>

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
            Aparência
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

        <View
          style={{
            marginTop: 24,
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
            Notificações
          </Text>

          <View
            style={{
              marginTop: 16,
              flexDirection: "row",
              alignItems: "flex-start",
            }}
          >
            <Ionicons
              name="notifications-outline"
              size={20}
              color={cores.primaria}
            />
            <Text
              style={{
                marginLeft: 12,
                flex: 1,
                fontSize: 16,
                lineHeight: 24,
                color: cores.textoSecundario,
              }}
            >
              O Moto Manager pode utilizar alertas por quilometragem e por data
              para lembrar você sobre manutenções e acompanhamentos importantes.
            </Text>
          </View>
        </View>

        <View
          style={{
            marginTop: 24,
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
            Sobre
          </Text>

          <View style={{ marginTop: 16 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
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
              Organize suas motos, manutenções e alertas em um só lugar.
            </Text>

            <Text
              style={{
                marginTop: 16,
                fontSize: 14,
                fontWeight: "500",
                color: cores.textoSuave,
              }}
            >
              Versão 1.0.0
            </Text>
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
  cores: {
    fundo: string;
    fundoSecundario: string;
    fundoCard: string;
    borda: string;
    texto: string;
    textoSecundario: string;
    textoSuave: string;
    primaria: string;
    perigo: string;
  };
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