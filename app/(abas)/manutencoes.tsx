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
import { Manutencao } from "../../src/tipos/manutencao";
import { Moto } from "../../src/tipos/moto";

export default function TelaManutencoes() {
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

      carregarDados();
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
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-950">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="mt-4 text-base text-slate-300">
          Carregando manutenções...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView contentContainerClassName="px-5 pt-14 pb-6">
        <View className="flex-row items-start justify-between">
          <View className="h-8 w-8" />

          <View className="flex-1 px-4">
            <Text className="text-center text-3xl font-bold text-white">
              Manutenções
            </Text>
            <Text className="mt-1 text-center text-base text-slate-300">
              {motoSelecionada
                ? `${motoSelecionada.marca} ${motoSelecionada.modelo}`
                : "Nenhuma moto selecionada"}
            </Text>
          </View>

          <TouchableOpacity
            className="h-8 w-8 items-center justify-center rounded-full bg-cyan-500"
            onPress={irParaNovaManutencao}
            activeOpacity={0.8}
            disabled={!motoSelecionada}
          >
            <Ionicons name="add" size={18} color="#020617" />
          </TouchableOpacity>
        </View>

        {!motoSelecionada ? (
          <View className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <Text className="text-base text-slate-300">
              Selecione uma moto na aba Moto para ver e cadastrar manutenções.
            </Text>
          </View>
        ) : null}

        {motoSelecionada && manutencoes.length === 0 ? (
          <View className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <Text className="text-base text-slate-300">
              Nenhuma manutenção registrada até o momento.
            </Text>
          </View>
        ) : null}

        <View className="mt-6 gap-3">
          {manutencoes.map((manutencao) => (
            <TouchableOpacity
              key={manutencao.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
              activeOpacity={0.8}
              onPress={() => abrirManutencao(manutencao.id)}
            >
              <Text className="text-lg font-bold text-white">
                {manutencao.tipo}
              </Text>

              <Text className="mt-2 text-sm text-slate-400">
                Data: {formatarData(manutencao.data)}
              </Text>

              <Text className="mt-1 text-sm text-slate-400">
                Quilometragem:{" "}
                {manutencao.quilometragem.toLocaleString("pt-BR")} km
              </Text>

              {typeof manutencao.custo === "number" ? (
                <Text className="mt-1 text-sm text-slate-400">
                  Valor: {formatarBRL(manutencao.custo)}
                </Text>
              ) : null}

              {manutencao.observacao ? (
                <Text className="mt-3 text-base text-slate-300">
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