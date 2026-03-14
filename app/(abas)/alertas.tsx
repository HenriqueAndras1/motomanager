import { useCallback, useMemo, useState } from "react";
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
import {
  buscarMotoSelecionadaId,
} from "../../src/servicos/moto-selecionada-firebase";
import {
  buscarAlertasPorMotoId,
} from "../../src/servicos/alertas-firebase";
import { obterMotoPorId } from "../../src/servicos/motos-firebase";
import { Alerta } from "../../src/tipos/alerta";
import { Moto } from "../../src/tipos/moto";

export default function TelaAlertas() {
  const [carregando, setCarregando] = useState(true);
  const [motoSelecionada, setMotoSelecionada] = useState<Moto | null>(null);
  const [alertas, setAlertas] = useState<Alerta[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function carregarDados(): Promise<void> {
        setCarregando(true);

        try {
          const motoSelecionadaId = await buscarMotoSelecionadaId();

          if (!motoSelecionadaId) {
            setMotoSelecionada(null);
            setAlertas([]);
            return;
          }

          const moto = await obterMotoPorId(motoSelecionadaId);

          if (!moto) {
            setMotoSelecionada(null);
            setAlertas([]);
            return;
          }

          const listaAlertas = await buscarAlertasPorMotoId(motoSelecionadaId);

          setMotoSelecionada(moto);
          setAlertas(listaAlertas);
        } finally {
          setCarregando(false);
        }
      }

      carregarDados();
    }, []),
  );

  const alertasAtivos = useMemo(
    () => alertas.filter((alerta) => alerta.ativo && !alerta.concluido),
    [alertas],
  );

  const historicoAlertas = useMemo(
    () => alertas.filter((alerta) => alerta.concluido || !alerta.ativo),
    [alertas],
  );

  function irParaNovoAlerta(): void {
    router.push("/alertas/novo");
  }

  function irParaDetalhesAlerta(id: string): void {
    router.push(`/alertas/${id}`);
  }

  if (carregando) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-950">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="mt-4 text-base text-slate-300">
          Carregando alertas...
        </Text>
      </SafeAreaView>
    );
  }

  if (!motoSelecionada) {
    return (
      <SafeAreaView className="flex-1 bg-slate-950">
        <View className="flex-1 px-5 pt-14 pb-6">
          <View className="mb-6 flex-row items-start justify-between">
            <View className="h-8 w-8" />

            <View className="flex-1 px-4">
              <Text className="text-center text-3xl font-bold text-white">
                Alertas
              </Text>
              <Text className="mt-1 text-center text-base text-slate-300">
                Configure alertas por moto
              </Text>
            </View>

            <TouchableOpacity
              className="h-8 w-8 items-center justify-center rounded-full bg-cyan-500"
              onPress={irParaNovoAlerta}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={18} color="#020617" />
            </TouchableOpacity>
          </View>

          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-center text-base text-slate-300">
              Nenhuma moto selecionada.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView contentContainerClassName="px-5 pt-14 pb-6">
        <View className="mb-6 flex-row items-start justify-between">
          <View className="h-8 w-8" />

          <View className="flex-1 px-4">
            <Text className="text-center text-3xl font-bold text-white">
              Alertas
            </Text>
            <Text className="mt-1 text-center text-base text-slate-300">
              {motoSelecionada.marca} {motoSelecionada.modelo}
            </Text>
          </View>

          <TouchableOpacity
            className="h-8 w-8 items-center justify-center rounded-full bg-cyan-500"
            onPress={irParaNovoAlerta}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color="#020617" />
          </TouchableOpacity>
        </View>

        <SecaoAlertas
          titulo="Ativos"
          vazio="Nenhum alerta ativo."
          alertas={alertasAtivos}
          aoPressionarAlerta={irParaDetalhesAlerta}
        />

        <View className="mt-6" />

        <SecaoAlertas
          titulo="Histórico"
          vazio="Nenhum alerta concluído ou inativo."
          alertas={historicoAlertas}
          aoPressionarAlerta={irParaDetalhesAlerta}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

type SecaoAlertasProps = {
  titulo: string;
  vazio: string;
  alertas: Alerta[];
  aoPressionarAlerta: (id: string) => void;
};

function SecaoAlertas({
  titulo,
  vazio,
  alertas,
  aoPressionarAlerta,
}: SecaoAlertasProps) {
  return (
    <View className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <Text className="text-lg font-bold text-white">{titulo}</Text>

      {alertas.length === 0 ? (
        <Text className="mt-3 text-base text-slate-300">{vazio}</Text>
      ) : (
        <View className="mt-4 gap-3">
          {alertas.map((alerta) => (
            <TouchableOpacity
              key={alerta.id}
              className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-4"
              onPress={() => aoPressionarAlerta(alerta.id)}
              activeOpacity={0.8}
            >
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-base font-bold text-white">
                    {alerta.titulo}
                  </Text>

                  <Text className="mt-1 text-sm text-slate-400">
                    {formatarDescricaoAlerta(alerta)}
                  </Text>
                </View>

                <View
                  className={`rounded-full px-3 py-1 ${
                    alerta.ativo && !alerta.concluido
                      ? "bg-cyan-500/15"
                      : "bg-slate-800"
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      alerta.ativo && !alerta.concluido
                        ? "text-cyan-400"
                        : "text-slate-300"
                    }`}
                  >
                    {alerta.ativo && !alerta.concluido ? "ATIVO" : "HISTÓRICO"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

function formatarDescricaoAlerta(alerta: Alerta): string {
  if (alerta.tipo === "manutencao_km") {
    const alvo =
      typeof alerta.quilometragemObjetivo === "number"
        ? `${alerta.quilometragemObjetivo.toLocaleString("pt-BR")} km`
        : "KM não definido";

    const prevista = alerta.dataPrevista
      ? ` • Previsto: ${formatarData(alerta.dataPrevista)}`
      : "";

    return `Meta: ${alvo}${prevista}`;
  }

  if (alerta.dataAlvo) {
    return `Data alvo: ${formatarData(alerta.dataAlvo)}`;
  }

  return "Sem detalhes";
}

function formatarData(data: string): string {
  const dataFormatada = new Date(`${data}T00:00:00`);
  return dataFormatada.toLocaleDateString("pt-BR");
}