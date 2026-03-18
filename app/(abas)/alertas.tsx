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
import { buscarMotoSelecionadaId } from "../../src/servicos/moto-selecionada-firebase";
import { buscarAlertasPorMotoId } from "../../src/servicos/alertas-firebase";
import { obterMotoPorId } from "../../src/servicos/motos-firebase";
import { useTema } from "../../src/contextos/tema-contexto";
import { Alerta } from "../../src/tipos/alerta";
import { Moto } from "../../src/tipos/moto";

export default function TelaAlertas() {
  const { cores } = useTema();

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

      void carregarDados();
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
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: cores.fundo }}
      >
        <ActivityIndicator size="large" color={cores.primaria} />
        <Text
          className="mt-4 text-base"
          style={{ color: cores.textoSecundario }}
        >
          Carregando alertas...
        </Text>
      </SafeAreaView>
    );
  }

  if (!motoSelecionada) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: cores.fundo }}>
        <View className="flex-1 px-5 pt-14 pb-6">
          <View className="mb-6 flex-row items-start justify-between">
            <View className="h-8 w-8" />

            <View className="flex-1 px-4">
              <Text
                className="text-center text-3xl font-bold"
                style={{ color: cores.texto }}
              >
                Alertas
              </Text>
              <Text
                className="mt-1 text-center text-base"
                style={{ color: cores.textoSecundario }}
              >
                Configure alertas por moto
              </Text>
            </View>

            <TouchableOpacity
              className="h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: cores.primaria }}
              onPress={irParaNovoAlerta}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={18} color={cores.fundo} />
            </TouchableOpacity>
          </View>

          <View className="flex-1 items-center justify-center px-6">
            <Text
              className="text-center text-base"
              style={{ color: cores.textoSecundario }}
            >
              Nenhuma moto selecionada.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: cores.fundo }}>
      <ScrollView contentContainerClassName="px-5 pt-14 pb-6">
        <View className="mb-6 flex-row items-start justify-between">
          <View className="h-8 w-8" />

          <View className="flex-1 px-4">
            <Text
              className="text-center text-3xl font-bold"
              style={{ color: cores.texto }}
            >
              Alertas
            </Text>
            <Text
              className="mt-1 text-center text-base"
              style={{ color: cores.textoSecundario }}
            >
              {motoSelecionada.marca} {motoSelecionada.modelo}
            </Text>
          </View>

          <TouchableOpacity
            className="h-8 w-8 items-center justify-center rounded-full"
            style={{ backgroundColor: cores.primaria }}
            onPress={irParaNovoAlerta}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color={cores.fundo} />
          </TouchableOpacity>
        </View>

        <SecaoAlertas
          titulo="Ativos"
          vazio="Nenhum alerta ativo."
          alertas={alertasAtivos}
          aoPressionarAlerta={irParaDetalhesAlerta}
          cores={cores}
        />

        <View className="mt-6" />

        <SecaoAlertas
          titulo="Histórico"
          vazio="Nenhum alerta concluído ou inativo."
          alertas={historicoAlertas}
          aoPressionarAlerta={irParaDetalhesAlerta}
          cores={cores}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

type CoresTema = {
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

type SecaoAlertasProps = {
  titulo: string;
  vazio: string;
  alertas: Alerta[];
  aoPressionarAlerta: (id: string) => void;
  cores: CoresTema;
};

function SecaoAlertas({
  titulo,
  vazio,
  alertas,
  aoPressionarAlerta,
  cores,
}: SecaoAlertasProps) {
  return (
    <View
      className="rounded-2xl p-5"
      style={{
        borderWidth: 1,
        borderColor: cores.borda,
        backgroundColor: cores.fundoCard,
      }}
    >
      <Text className="text-lg font-bold" style={{ color: cores.texto }}>
        {titulo}
      </Text>

      {alertas.length === 0 ? (
        <Text className="mt-3 text-base" style={{ color: cores.textoSecundario }}>
          {vazio}
        </Text>
      ) : (
        <View className="mt-4 gap-3">
          {alertas.map((alerta) => {
            const estaAtivo = alerta.ativo && !alerta.concluido;

            return (
              <TouchableOpacity
                key={alerta.id}
                className="rounded-2xl px-4 py-4"
                style={{
                  borderWidth: 1,
                  borderColor: cores.borda,
                  backgroundColor: cores.fundo,
                }}
                onPress={() => aoPressionarAlerta(alerta.id)}
                activeOpacity={0.8}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 pr-3">
                    <Text
                      className="text-base font-bold"
                      style={{ color: cores.texto }}
                    >
                      {alerta.titulo}
                    </Text>

                    <Text
                      className="mt-1 text-sm"
                      style={{ color: cores.textoSuave }}
                    >
                      {formatarDescricaoAlerta(alerta)}
                    </Text>
                  </View>

                  <View
                    className="rounded-full px-3 py-1"
                    style={{
                      backgroundColor: estaAtivo
                        ? `${cores.primaria}26`
                        : cores.borda,
                    }}
                  >
                    <Text
                      className="text-xs font-bold"
                      style={{
                        color: estaAtivo ? cores.primaria : cores.textoSecundario,
                      }}
                    >
                      {estaAtivo ? "ATIVO" : "HISTÓRICO"}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
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