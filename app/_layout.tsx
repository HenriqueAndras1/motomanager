import "../global.css";
import { Stack } from "expo-router";
import {
  MD3DarkTheme,
  MD3LightTheme,
  Provider as PaperProvider,
} from "react-native-paper";
import { TemaProvider, useTema } from "../src/contextos/tema-contexto";
import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Modal, Linking } from "react-native";
import * as Updates from "expo-updates";
import { verificarAtualizacaoOTA } from "../src/utils/atualizacaoOTA";

// 🔥 NOVO IMPORT
import { verificarVersaoApp } from "../src/utils/verificarVersaoApp";

function AppComTema() {
  const { tema } = useTema();

  // 🔥 OTA
  const [updateDisponivel, setUpdateDisponivel] = useState(false);
  const [obrigatorio, setObrigatorio] = useState(false);

  // 🔥 BLOQUEIO POR VERSÃO
  const [bloqueado, setBloqueado] = useState(false);

  // 🔥 VERIFICAÇÕES GLOBAIS
  useEffect(() => {
    verificarAtualizacaoOTA({
      setUpdateDisponivel,
      setObrigatorio,
    });

    verificarVersaoApp(setBloqueado);
  }, []);

  const temaPaper =
    tema === "claro"
      ? {
          ...MD3LightTheme,
          colors: {
            ...MD3LightTheme.colors,
            primary: "#06b6d4",
            background: "#f8fafc",
            surface: "#ffffff",
            surfaceVariant: "#e2e8f0",
            onSurface: "#0f172a",
            outline: "#cbd5e1",
            error: "#ef4444",
          },
        }
      : {
          ...MD3DarkTheme,
          colors: {
            ...MD3DarkTheme.colors,
            primary: "#06b6d4",
            background: "#020617",
            surface: "#0f172a",
            surfaceVariant: "#1e293b",
            onSurface: "#ffffff",
            outline: "#334155",
            error: "#ef4444",
          },
        };

  return (
    <PaperProvider theme={temaPaper}>
      <>
        <Stack screenOptions={{ headerShown: false }} />

        {/* 🔥 MODAL OTA (OBRIGATÓRIO) */}
        <Modal
          visible={updateDisponivel}
          transparent
          animationType="fade"
          onRequestClose={() => {}}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: "85%",
                backgroundColor: temaPaper.colors.background,
                borderRadius: 16,
                padding: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: temaPaper.colors.onSurface,
                }}
              >
                Atualização obrigatória ⚠️
              </Text>

              <Text
                style={{
                  marginTop: 10,
                  color: temaPaper.colors.onSurface,
                  opacity: 0.7,
                }}
              >
                É necessário atualizar o app para continuar usando.
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  marginTop: 20,
                }}
              >
                <TouchableOpacity
                  onPress={() => Updates.reloadAsync()}
                  style={{
                    backgroundColor: temaPaper.colors.primary,
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "600" }}>
                    Atualizar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* 🔥 MODAL BLOQUEIO POR VERSÃO */}
        <Modal
          visible={bloqueado}
          transparent
          animationType="fade"
          onRequestClose={() => {}}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.7)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: "85%",
                backgroundColor: temaPaper.colors.background,
                borderRadius: 16,
                padding: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: temaPaper.colors.onSurface,
                }}
              >
                Atualize o aplicativo 🚀
              </Text>

              <Text
                style={{
                  marginTop: 10,
                  color: temaPaper.colors.onSurface,
                  opacity: 0.7,
                }}
              >
                Esta versão está desatualizada. Atualize para continuar usando.
              </Text>

              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(
                    "https://github.com/HenriqueAndras1/motomanager/releases/latest/download/app.apk"
                  )
                }
                style={{
                  marginTop: 20,
                  backgroundColor: temaPaper.colors.primary,
                  paddingVertical: 12,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  Baixar atualização
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </>
    </PaperProvider>
  );
}

export default function LayoutRaiz() {
  return (
    <TemaProvider>
      <AppComTema />
    </TemaProvider>
  );
}