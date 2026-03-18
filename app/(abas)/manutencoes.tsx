import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { buscarMotoSelecionadaId } from "../../src/servicos/moto-selecionada-firebase";
import { obterMotoPorId } from "../../src/servicos/motos-firebase";
import { buscarManutencoesPorMotoId } from "../../src/servicos/manutencoes-firebase";
import { useTema } from "../../src/contextos/tema-contexto";
import { Manutencao } from "../../src/tipos/manutencao";
import { Moto } from "../../src/tipos/moto";

export default function TelaManutencoes() {
  const { cores } = useTema();

  const [carregando, setCarregando] = useState(true);
  const [motoSelecionada, setMotoSelecionada] = useState<Moto | null>(null);
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function carregarDados(): Promise<void> {
        setCarregando(true);

        try {
          const motoSelecionadaId = await buscarMotoSelecionadaId();

          if (!motoSelecionadaId) {
            setMotoSelecionada(null);
            setManutencoes([]);
            return;
          }

          const moto = await obterMotoPorId(motoSelecionadaId);
          setMotoSelecionada(moto);

          if (!moto) {
            setManutencoes([]);
            return;
          }

          const lista = await buscarManutencoesPorMotoId(moto.id);
          setManutencoes(lista);
        } finally {
          setCarregando(false);
        }
      }

      void carregarDados();
    }, []),
  );

  function irParaNovaManutencao(): void {
    router.push("/manutencoes/nova");
  }

  function abrirManutencao(id: string): void {
    router.push(`/manutencoes/${id}`);
  }

  if (carregando) {
    return (
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: cores.fundo }}
      >
        <ActivityIndicator size="large" color={cores.primaria} />
        <Text
          className="mt-4 text-base"
          style={{ color: cores.textoSecundario }}
        >
          Carregando manutenções...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: cores.fundo }}>
      <ScrollView contentContainerClassName="px-5 pt-14 pb-6">
        <View className="flex-row items-start justify-between">
          <View className="h-8 w-8" />

          <View className="flex-1 px-4">
            <Text
              className="text-center text-3xl font-bold"
              style={{ color: cores.texto }}
            >
              Manutenções
            </Text>
            <Text
              className="mt-1 text-center text-base"
              style={{ color: cores.textoSecundario }}
            >
              {motoSelecionada
                ? `${motoSelecionada.marca} ${motoSelecionada.modelo}`
                : "Nenhuma moto selecionada"}
            </Text>
          </View>

          <TouchableOpacity
            className="h-8 w-8 items-center justify-center rounded-full"
            style={{
              backgroundColor: motoSelecionada ? cores.primaria : cores.borda,
            }}
            onPress={irParaNovaManutencao}
            activeOpacity={0.8}
            disabled={!motoSelecionada}
          >
            <Ionicons
              name="add"
              size={18}
              color={motoSelecionada ? cores.fundo : cores.textoSuave}
            />
          </TouchableOpacity>
        </View>

        {!motoSelecionada ? (
          <View
            className="mt-6 rounded-2xl p-5"
            style={{
              borderWidth: 1,
              borderColor: cores.borda,
              backgroundColor: cores.fundoCard,
            }}
          >
            <Text className="text-base" style={{ color: cores.textoSecundario }}>
              Selecione uma moto na aba Moto para ver e cadastrar manutenções.
            </Text>
          </View>
        ) : null}

        {motoSelecionada && manutencoes.length === 0 ? (
          <View
            className="mt-6 rounded-2xl p-5"
            style={{
              borderWidth: 1,
              borderColor: cores.borda,
              backgroundColor: cores.fundoCard,
            }}
          >
            <Text className="text-base" style={{ color: cores.textoSecundario }}>
              Nenhuma manutenção registrada até o momento.
            </Text>
          </View>
        ) : null}

        <View className="mt-6 gap-3">
          {manutencoes.map((manutencao) => (
            <TouchableOpacity
              key={manutencao.id}
              className="rounded-2xl p-5"
              style={{
                borderWidth: 1,
                borderColor: cores.borda,
                backgroundColor: cores.fundoCard,
              }}
              activeOpacity={0.8}
              onPress={() => abrirManutencao(manutencao.id)}
            >
              <Text
                className="text-lg font-bold"
                style={{ color: cores.texto }}
              >
                {manutencao.tipo}
              </Text>

              <Text className="mt-2 text-sm" style={{ color: cores.textoSuave }}>
                Data: {formatarData(manutencao.data)}
              </Text>

              <Text className="mt-1 text-sm" style={{ color: cores.textoSuave }}>
                Quilometragem:{" "}
                {manutencao.quilometragem.toLocaleString("pt-BR")} km
              </Text>

              {typeof manutencao.custo === "number" ? (
                <Text
                  className="mt-1 text-sm"
                  style={{ color: cores.textoSuave }}
                >
                  Valor: {formatarBRL(manutencao.custo)}
                </Text>
              ) : null}

              {manutencao.observacao ? (
                <Text
                  className="mt-3 text-base"
                  style={{ color: cores.textoSecundario }}
                >
                  {manutencao.observacao}
                </Text>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function formatarData(data: string): string {
  const dataFormatada = new Date(`${data}T00:00:00`);
  return dataFormatada.toLocaleDateString("pt-BR");
}

function formatarBRL(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}