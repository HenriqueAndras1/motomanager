import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  excluirManutencao,
  obterManutencaoPorId,
} from "../../src/servicos/manutencoes-firebase";
import AlertaApp from "../../src/componentes/AlertaApp";
import { useTema } from "../../src/contextos/tema-contexto";
import { Manutencao } from "../../src/tipos/manutencao";

type ParametrosRota = {
  id?: string;
};

export default function TelaDetalhesManutencao() {
  const { cores } = useTema();
  const { id } = useLocalSearchParams<ParametrosRota>();

  const [manutencao, setManutencao] = useState<Manutencao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [excluindo, setExcluindo] = useState(false);
  const [menuAcoesAberto, setMenuAcoesAberto] = useState(false);
  const [alertaExclusaoAberto, setAlertaExclusaoAberto] = useState(false);
  const [alertaErroAberto, setAlertaErroAberto] = useState(false);

  useEffect(() => {
    async function carregar(): Promise<void> {
      if (!id) {
        setCarregando(false);
        return;
      }

      try {
        const resultado = await obterManutencaoPorId(id);
        setManutencao(resultado);
      } finally {
        setCarregando(false);
      }
    }

    void carregar();
  }, [id]);

  function voltar(): void {
    router.replace("/(abas)/manutencoes");
  }

  function irParaEditar(): void {
    if (!id) {
      return;
    }

    setMenuAcoesAberto(false);
    router.push(`/manutencoes/editar?id=${id}`);
  }

  function confirmarExclusao(): void {
    if (!id || excluindo) {
      return;
    }

    setMenuAcoesAberto(false);
    setAlertaExclusaoAberto(true);
  }

  async function excluir(manutencaoId: string): Promise<void> {
    setExcluindo(true);

    try {
      await excluirManutencao(manutencaoId);
      setAlertaExclusaoAberto(false);
      router.replace("/(abas)/manutencoes");
    } catch (erro) {
      console.error("Erro ao excluir manutenção:", erro);
      setAlertaExclusaoAberto(false);
      setAlertaErroAberto(true);
    } finally {
      setExcluindo(false);
    }
  }

  if (carregando) {
    return (
      <>
        <SafeAreaView
          className="flex-1 items-center justify-center"
          style={{ backgroundColor: cores.fundo }}
        >
          <ActivityIndicator size="large" color={cores.primaria} />
          <Text
            className="mt-4 text-base"
            style={{ color: cores.textoSecundario }}
          >
            Carregando manutenção...
          </Text>
        </SafeAreaView>

        <AlertaApp
          visivel={alertaExclusaoAberto}
          titulo="Excluir manutenção"
          mensagem="Tem certeza que deseja excluir esta manutenção?"
          variante="erro"
          textoConfirmar="Excluir"
          textoCancelar="Cancelar"
          mostrarCancelar
          carregando={excluindo}
          aoFechar={() => setAlertaExclusaoAberto(false)}
          aoCancelar={() => setAlertaExclusaoAberto(false)}
          aoConfirmar={() => {
            if (id) {
              void excluir(id);
            }
          }}
        />

        <AlertaApp
          visivel={alertaErroAberto}
          titulo="Erro"
          mensagem="Não foi possível excluir a manutenção."
          variante="erro"
          textoConfirmar="Fechar"
          aoFechar={() => setAlertaErroAberto(false)}
          aoConfirmar={() => setAlertaErroAberto(false)}
        />
      </>
    );
  }

  if (!manutencao) {
    return (
      <>
        <SafeAreaView className="flex-1" style={{ backgroundColor: cores.fundo }}>
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-base" style={{ color: cores.textoSecundario }}>
              Manutenção não encontrada.
            </Text>
          </View>
        </SafeAreaView>

        <AlertaApp
          visivel={alertaExclusaoAberto}
          titulo="Excluir manutenção"
          mensagem="Tem certeza que deseja excluir esta manutenção?"
          variante="erro"
          textoConfirmar="Excluir"
          textoCancelar="Cancelar"
          mostrarCancelar
          carregando={excluindo}
          aoFechar={() => setAlertaExclusaoAberto(false)}
          aoCancelar={() => setAlertaExclusaoAberto(false)}
          aoConfirmar={() => {
            if (id) {
              void excluir(id);
            }
          }}
        />

        <AlertaApp
          visivel={alertaErroAberto}
          titulo="Erro"
          mensagem="Não foi possível excluir a manutenção."
          variante="erro"
          textoConfirmar="Fechar"
          aoFechar={() => setAlertaErroAberto(false)}
          aoConfirmar={() => setAlertaErroAberto(false)}
        />
      </>
    );
  }

  return (
    <>
      <SafeAreaView className="flex-1" style={{ backgroundColor: cores.fundo }}>
        <View className="flex-1">
          <ScrollView contentContainerClassName="px-5 pt-14 pb-6">
            <View className="relative">
              <View className="mb-6 flex-row items-center justify-between">
                <TouchableOpacity
                  className="h-10 w-10 items-center justify-center rounded-full"
                  style={{ backgroundColor: cores.fundoCard }}
                  onPress={voltar}
                  activeOpacity={0.8}
                >
                  <Ionicons name="arrow-back" size={22} color={cores.texto} />
                </TouchableOpacity>

                <View className="flex-1 px-4">
                  <Text
                    className="text-center text-3xl font-bold"
                    style={{ color: cores.texto }}
                  >
                    Manutenção
                  </Text>
                  <Text
                    className="mt-1 text-center text-base"
                    style={{ color: cores.textoSecundario }}
                  >
                    Detalhes do registro
                  </Text>
                </View>

                <TouchableOpacity
                  className="h-10 w-10 items-center justify-center"
                  onPress={() =>
                    setMenuAcoesAberto((estadoAtual) => !estadoAtual)
                  }
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="ellipsis-vertical"
                    size={20}
                    color={cores.texto}
                  />
                </TouchableOpacity>
              </View>

              <View
                className="rounded-2xl p-5"
                style={{
                  borderWidth: 1,
                  borderColor: cores.borda,
                  backgroundColor: cores.fundoCard,
                }}
              >
                <Text
                  className="text-xl font-bold"
                  style={{ color: cores.texto }}
                >
                  {manutencao.tipo}
                </Text>

                <View className="mt-4">
                  <LinhaInformacao
                    titulo="Data"
                    valor={formatarData(manutencao.data)}
                    cores={cores}
                  />
                  <LinhaInformacao
                    titulo="Quilometragem"
                    valor={`${manutencao.quilometragem.toLocaleString("pt-BR")} km`}
                    cores={cores}
                  />
                  <LinhaInformacao
                    titulo="Valor"
                    valor={
                      typeof manutencao.custo === "number"
                        ? formatarBRL(manutencao.custo)
                        : "Não informado"
                    }
                    cores={cores}
                  />
                  <LinhaInformacao
                    titulo="Observação"
                    valor={
                      manutencao.observacao
                        ? manutencao.observacao
                        : "Não informada"
                    }
                    cores={cores}
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          {menuAcoesAberto ? (
            <>
              <TouchableOpacity
                className="absolute inset-0"
                activeOpacity={1}
                onPress={() => setMenuAcoesAberto(false)}
              />

              <View
                className="absolute right-5 top-24 w-56 rounded-2xl p-2"
                style={{
                  borderWidth: 1,
                  borderColor: cores.borda,
                  backgroundColor: cores.fundoCard,
                }}
              >
                <TouchableOpacity
                  className="flex-row items-center rounded-xl px-4 py-3"
                  onPress={irParaEditar}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="create-outline"
                    size={18}
                    color={cores.primaria}
                  />
                  <Text
                    className="ml-3 text-base font-medium"
                    style={{ color: cores.texto }}
                  >
                    Editar manutenção
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="mt-1 flex-row items-center rounded-xl px-4 py-3"
                  onPress={confirmarExclusao}
                  activeOpacity={0.8}
                  disabled={excluindo}
                >
                  {excluindo ? (
                    <ActivityIndicator size="small" color={cores.perigo} />
                  ) : (
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color={cores.perigo}
                    />
                  )}

                  <Text
                    className="ml-3 text-base font-medium"
                    style={{ color: cores.perigo }}
                  >
                    {excluindo ? "Excluindo..." : "Excluir manutenção"}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : null}
        </View>
      </SafeAreaView>

      <AlertaApp
        visivel={alertaExclusaoAberto}
        titulo="Excluir manutenção"
        mensagem="Tem certeza que deseja excluir esta manutenção?"
        variante="erro"
        textoConfirmar="Excluir"
        textoCancelar="Cancelar"
        mostrarCancelar
        carregando={excluindo}
        aoFechar={() => setAlertaExclusaoAberto(false)}
        aoCancelar={() => setAlertaExclusaoAberto(false)}
        aoConfirmar={() => {
          if (id) {
            void excluir(id);
          }
        }}
      />

      <AlertaApp
        visivel={alertaErroAberto}
        titulo="Erro"
        mensagem="Não foi possível excluir a manutenção."
        variante="erro"
        textoConfirmar="Fechar"
        aoFechar={() => setAlertaErroAberto(false)}
        aoConfirmar={() => setAlertaErroAberto(false)}
      />
    </>
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

type LinhaInformacaoProps = {
  titulo: string;
  valor: string;
  cores: CoresTema;
};

function LinhaInformacao({ titulo, valor, cores }: LinhaInformacaoProps) {
  return (
    <View className="mt-3">
      <Text
        className="text-sm font-medium"
        style={{ color: cores.textoSuave }}
      >
        {titulo}
      </Text>

      <Text className="mt-1 text-base" style={{ color: cores.texto }}>
        {valor}
      </Text>
    </View>
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