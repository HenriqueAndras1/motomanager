import React from "react";
import { Text, View } from "react-native";
import { Button, Dialog, Portal } from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";

type VarianteAlerta = "padrao" | "sucesso" | "erro" | "aviso";

type Props = {
  visivel: boolean;
  titulo?: string;
  mensagem: string;
  variante?: VarianteAlerta;
  textoConfirmar?: string;
  textoCancelar?: string;
  carregando?: boolean;
  mostrarCancelar?: boolean;
  aoConfirmar?: () => void;
  aoCancelar?: () => void;
  aoFechar?: () => void;
};

type ConfiguracaoVisual = {
  icone: keyof typeof Ionicons.glyphMap;
  corIcone: string;
  fundoIcone: string;
};

function obterConfiguracaoVisual(variante: VarianteAlerta): ConfiguracaoVisual {
  switch (variante) {
    case "sucesso":
      return {
        icone: "checkmark-circle-outline",
        corIcone: "#22c55e",
        fundoIcone: "bg-green-500/15",
      };
    case "erro":
      return {
        icone: "close-circle-outline",
        corIcone: "#ef4444",
        fundoIcone: "bg-red-500/15",
      };
    case "aviso":
      return {
        icone: "alert-circle-outline",
        corIcone: "#f59e0b",
        fundoIcone: "bg-amber-500/15",
      };
    case "padrao":
    default:
      return {
        icone: "information-circle-outline",
        corIcone: "#22d3ee",
        fundoIcone: "bg-cyan-500/15",
      };
  }
}

export default function AlertaApp({
  visivel,
  titulo,
  mensagem,
  variante = "padrao",
  textoConfirmar,
  textoCancelar = "Cancelar",
  carregando = false,
  mostrarCancelar = false,
  aoConfirmar,
  aoCancelar,
  aoFechar,
}: Props) {
  const configuracao = obterConfiguracaoVisual(variante);
  const temTitulo = Boolean(titulo?.trim());

  function tratarFechamento(): void {
    if (carregando) {
      return;
    }

    aoFechar?.();
  }

  function tratarCancelar(): void {
    if (carregando) {
      return;
    }

    aoCancelar?.();
  }

  function tratarConfirmacao(): void {
    if (carregando) {
      return;
    }

    aoConfirmar?.();
  }

  return (
    <Portal>
      <Dialog
  visible={visivel}
  onDismiss={tratarFechamento}
  style={{
    backgroundColor: "#2b3a4d",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#ffffff",
  }}
>
        <Dialog.Content>
          <View className={temTitulo ? "flex-row items-center" : "items-center"}>
            <View
              className={`h-12 w-12 items-center justify-center rounded-full ${configuracao.fundoIcone}`}
            >
              <Ionicons
                name={configuracao.icone}
                size={24}
                color={configuracao.corIcone}
              />
            </View>

            {temTitulo ? (
              <Text className="ml-3 text-xl font-bold text-white">{titulo}</Text>
            ) : null}
          </View>

          <Text
            className={`mt-4 text-base leading-6 text-slate-200 ${
              temTitulo ? "" : "text-center"
            }`}
          >
            {mensagem}
          </Text>
        </Dialog.Content>

        {mostrarCancelar || textoConfirmar ? (
          <Dialog.Actions style={{ paddingHorizontal: 20, paddingBottom: 20 }}>
            {mostrarCancelar ? (
              <Button
                mode="outlined"
                onPress={tratarCancelar}
                disabled={carregando}
                textColor="#ffffff"
                style={{
                  borderColor: "#475569",
                  borderRadius: 16,
                  marginRight: 8,
                }}
              >
                {textoCancelar}
              </Button>
            ) : null}

            {textoConfirmar ? (
              <Button
                mode="contained"
                onPress={tratarConfirmacao}
                loading={carregando}
                disabled={carregando}
                buttonColor={variante === "erro" ? "#ef4444" : "#06b6d4"}
                textColor="#ffffff"
                style={{ borderRadius: 16 }}
              >
                {textoConfirmar}
              </Button>
            ) : null}
          </Dialog.Actions>
        ) : null}
      </Dialog>
    </Portal>
  );
}