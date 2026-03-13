import { useEffect, useState } from "react";
import {
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
import { Manutencao } from "../../src/tipos/manutencao";

type ParametrosRota = {
  id?: string;
};

export default function TelaDetalhesManutencao() {
  const { id } = useLocalSearchParams<ParametrosRota>();
  const [manutencao, setManutencao] = useState<Manutencao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [excluindo, setExcluindo] = useState(false);
  const [alertaExclusaoAberto, setAlertaExclusaoAberto] = useState(false);
  const [alertaSucessoAberto, setAlertaSucessoAberto] = useState(false);
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

    carregar();
  }, [id]);

  function voltar(): void {
    router.replace("/(abas)/manutencoes");
  }

  function irParaEditar(): void {
    if (!id) {
      return;
    }

    router.push(`/manutencoes/editar?id=${id}`);
  }

  function confirmarExclusao(): void {
    if (!id || excluindo) {
      return;
    }

    setAlertaExclusaoAberto(true);
  }

  async function excluir(manutencaoId: string): Promise<void> {
    setExcluindo(true);

    try {
      await excluirManutencao(manutencaoId);
      setAlertaExclusaoAberto(false);
      setAlertaSucessoAberto(true);
    } catch (erro) {
      console.error("Erro ao excluir manutenção:", erro);
      setAlertaExclusaoAberto(false);
      setAlertaErroAberto(true);
    } finally {
      setExcluindo(false);
    }
  }

  function fecharAlertaSucesso(): void {
    setAlertaSucessoAberto(false);
    router.replace("/(abas)/manutencoes");
  }

  if (carregando) {
    return (
      <>
        <SafeAreaView className="flex-1 items-center justify-center bg-slate-950">
          <Text className="text-base text-slate-300">
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
          visivel={alertaSucessoAberto}
          titulo="Sucesso"
          mensagem="Manutenção excluída com sucesso."
          variante="sucesso"
          textoConfirmar="Fechar"
          aoFechar={fecharAlertaSucesso}
          aoConfirmar={fecharAlertaSucesso}
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
        <SafeAreaView className="flex-1 bg-slate-950">
          <View className="flex-1 items-center justify-center px-6">
            <Text className="text-base text-slate-300">
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
          visivel={alertaSucessoAberto}
          titulo="Sucesso"
          mensagem="Manutenção excluída com sucesso."
          variante="sucesso"
          textoConfirmar="Fechar"
          aoFechar={fecharAlertaSucesso}
          aoConfirmar={fecharAlertaSucesso}
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
      <SafeAreaView className="flex-1 bg-slate-950">
        <ScrollView contentContainerClassName="px-5 pt-14 pb-6">
          <View className="mb-6 flex-row items-center justify-between">
            <TouchableOpacity
              className="h-10 w-10 items-center justify-center rounded-full bg-slate-900"
              onPress={voltar}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-back" size={22} color="#ffffff" />
            </TouchableOpacity>

            <View className="flex-1 px-4">
              <Text className="text-center text-3xl font-bold text-white">
                Manutenção
              </Text>
              <Text className="mt-1 text-center text-base text-slate-300">
                Detalhes do registro
              </Text>
            </View>

            <View className="h-10 w-10" />
          </View>

          <View className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <Text className="text-xl font-bold text-white">
              {manutencao.tipo}
            </Text>

            <View className="mt-4 gap-4">
              <LinhaInformacao
                titulo="Data"
                valor={formatarData(manutencao.data)}
              />
              <LinhaInformacao
                titulo="Quilometragem"
                valor={`${manutencao.quilometragem.toLocaleString("pt-BR")} km`}
              />
              <LinhaInformacao
                titulo="Valor"
                valor={
                  typeof manutencao.custo === "number"
                    ? formatarBRL(manutencao.custo)
                    : "Não informado"
                }
              />
              <LinhaInformacao
                titulo="Observação"
                valor={
                  manutencao.observacao ? manutencao.observacao : "Não informada"
                }
              />
            </View>
          </View>

          <View className="mt-6 gap-3">
            <TouchableOpacity
              className="items-center rounded-2xl bg-cyan-500 px-4 py-3"
              onPress={irParaEditar}
              activeOpacity={0.8}
            >
              <Text className="text-base font-bold text-slate-950">Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="items-center rounded-2xl bg-red-500 px-4 py-3"
              onPress={confirmarExclusao}
              activeOpacity={0.8}
              disabled={excluindo}
            >
              <Text className="text-base font-bold text-white">
                {excluindo ? "Excluindo..." : "Excluir"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
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
        visivel={alertaSucessoAberto}
        titulo="Sucesso"
        mensagem="Manutenção excluída com sucesso."
        variante="sucesso"
        textoConfirmar="Fechar"
        aoFechar={fecharAlertaSucesso}
        aoConfirmar={fecharAlertaSucesso}
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

type LinhaInformacaoProps = {
  titulo: string;
  valor: string;
};

function LinhaInformacao({ titulo, valor }: LinhaInformacaoProps) {
  return (
    <View className="border-b border-slate-800 pb-3">
      <Text className="text-sm font-medium text-slate-400">{titulo}</Text>
      <Text className="mt-1 text-base text-white">{valor}</Text>
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