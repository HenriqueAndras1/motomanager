import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useTema } from "../../../src/contextos/tema-contexto";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function TelaAtualizacao() {
  const { cores } = useTema();

  const versaoAtual = "1.0.0";

  const [carregando, setCarregando] = useState(false);
  const [temAtualizacao, setTemAtualizacao] = useState(false);
  const [urlDownload, setUrlDownload] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function verificarAtualizacao() {
    try {
      setCarregando(true);
      setMensagem("");
      setTemAtualizacao(false);

      const response = await fetch(
        "https://raw.githubusercontent.com/seuuser/moto-manager/main/version.json"
      );

      const data = await response.json();

      if (data.version !== versaoAtual) {
        setTemAtualizacao(true);
        setUrlDownload(data.url);
        setMensagem("Nova versão disponível!");
      } else {
        setMensagem("Você já está na versão mais recente.");
      }
    } catch (error) {
      setMensagem("Erro ao verificar atualização.");
    } finally {
      setCarregando(false);
    }
  }

  function baixarAtualizacao() {
    if (urlDownload) {
      Linking.openURL(urlDownload);
    }
  }

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
        <View style={{ flexDirection: "row", justifyContent: "center" }}>
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
            Atualização
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

          <Text
            style={{
              marginTop: 8,
              fontSize: 14,
              color: cores.textoSuave,
            }}
          >
            Versão atual: {versaoAtual}
          </Text>

          {/* BOTÃO VERIFICAR */}
          <TouchableOpacity
            onPress={verificarAtualizacao}
            activeOpacity={0.8}
            style={{
              marginTop: 20,
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: "center",
              backgroundColor: cores.primaria,
            }}
          >
            {carregando ? (
              <ActivityIndicator color={cores.fundo} />
            ) : (
              <Text
                style={{
                  color: cores.fundo,
                  fontWeight: "600",
                  fontSize: 16,
                }}
              >
                Verificar atualização
              </Text>
            )}
          </TouchableOpacity>

          {/* MENSAGEM */}
          {mensagem ? (
            <Text
              style={{
                marginTop: 16,
                textAlign: "center",
                color: cores.textoSuave,
              }}
            >
              {mensagem}
            </Text>
          ) : null}

          {/* BOTÃO BAIXAR (SÓ APARECE SE TIVER UPDATE) */}
          {temAtualizacao && (
            <TouchableOpacity
              onPress={baixarAtualizacao}
              activeOpacity={0.8}
              style={{
                marginTop: 16,
                borderRadius: 12,
                paddingVertical: 14,
                alignItems: "center",
                backgroundColor: cores.primaria,
              }}
            >
              <Text
                style={{
                  color: cores.fundo,
                  fontWeight: "600",
                  fontSize: 16,
                }}
              >
                Baixar atualização
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}