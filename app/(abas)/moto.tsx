import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { buscarMotos, excluirMoto } from "../../src/servicos/motos-firebase";
import {
  buscarMotoSelecionadaId,
  salvarMotoSelecionadaId,
} from "../../src/servicos/moto-selecionada-firebase";
import { obterUltimaManutencaoPorMotoId } from "../../src/servicos/manutencoes-firebase";
import AlertaApp from "../../src/componentes/AlertaApp";
import { Moto } from "../../src/tipos/moto";
import { Manutencao } from "../../src/tipos/manutencao";

export default function TelaMoto() {
  const [motos, setMotos] = useState<Moto[]>([]);
  const [motoSelecionada, setMotoSelecionada] = useState<Moto | null>(null);
  const [ultimaManutencao, setUltimaManutencao] = useState<Manutencao | null>(
    null,
  );
  const [carregando, setCarregando] = useState(true);
  const [seletorAberto, setSeletorAberto] = useState(false);
  const [menuAcoesAberto, setMenuAcoesAberto] = useState(false);
  const [alertaExclusaoAberto, setAlertaExclusaoAberto] = useState(false);
  const [alertaSucessoAberto, setAlertaSucessoAberto] = useState(false);
  const [alertaErroAberto, setAlertaErroAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const temMaisDeUmaMoto = useMemo(() => motos.length > 1, [motos.length]);

  useFocusEffect(
    useCallback(() => {
      async function carregarDados(): Promise<void> {
        setCarregando(true);

        try {
          const listaDeMotos = await buscarMotos();
          setMotos(listaDeMotos);

          if (listaDeMotos.length === 0) {
            setMotoSelecionada(null);
            setUltimaManutencao(null);
            router.replace("/motos/nova");
            return;
          }

          const motoSelecionadaId = await buscarMotoSelecionadaId();

          const motoEncontrada = motoSelecionadaId
            ? (listaDeMotos.find((moto) => moto.id === motoSelecionadaId) ??
              null)
            : null;

          const motoInicial = motoEncontrada ?? listaDeMotos[0];

          setMotoSelecionada(motoInicial);

          if (!motoSelecionadaId || motoSelecionadaId !== motoInicial.id) {
            await salvarMotoSelecionadaId(motoInicial.id);
          }

          const manutencao = await obterUltimaManutencaoPorMotoId(
            motoInicial.id,
          );
          setUltimaManutencao(manutencao);
        } finally {
          setCarregando(false);
        }
      }

      carregarDados();
    }, []),
  );

  async function selecionarMoto(moto: Moto): Promise<void> {
    setMotoSelecionada(moto);
    setSeletorAberto(false);
    setMenuAcoesAberto(false);
    await salvarMotoSelecionadaId(moto.id);

    const manutencao = await obterUltimaManutencaoPorMotoId(moto.id);
    setUltimaManutencao(manutencao);
  }

  function irParaNovaMoto(): void {
    setMenuAcoesAberto(false);
    router.push("/motos/nova");
  }

  function irParaEditarMoto(): void {
    if (!motoSelecionada) {
      return;
    }

    setMenuAcoesAberto(false);
    router.push(`/motos/editar?id=${motoSelecionada.id}`);
  }

  function confirmarExclusaoMoto(): void {
    if (!motoSelecionada || excluindo) {
      return;
    }

    setMenuAcoesAberto(false);
    setAlertaExclusaoAberto(true);
  }

  async function executarExclusaoMoto(): Promise<void> {
    if (!motoSelecionada) {
      return;
    }

    setExcluindo(true);

    try {
      const idExcluido = motoSelecionada.id;
      const listaRestante = motos.filter((moto) => moto.id !== idExcluido);

      await excluirMoto(idExcluido);

      if (listaRestante.length > 0) {
        const proximaMoto = listaRestante[0];
        await salvarMotoSelecionadaId(proximaMoto.id);
        setMotoSelecionada(proximaMoto);

        const manutencao = await obterUltimaManutencaoPorMotoId(proximaMoto.id);
        setUltimaManutencao(manutencao);
        setMotos(listaRestante);

        setAlertaExclusaoAberto(false);
        setAlertaSucessoAberto(true);
      } else {
        setMotoSelecionada(null);
        setUltimaManutencao(null);
        setMotos([]);
        setAlertaExclusaoAberto(false);
        router.replace("/motos/nova");
      }
    } catch (erro) {
      console.error("Erro ao excluir moto:", erro);
      setAlertaExclusaoAberto(false);
      setAlertaErroAberto(true);
    } finally {
      setExcluindo(false);
    }
  }

  if (carregando) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-950">
        <ActivityIndicator size="large" color="#ffffff" />
        <Text className="mt-4 text-base text-slate-300">
          Carregando moto...
        </Text>
      </SafeAreaView>
    );
  }

  if (!motoSelecionada) {
    return (
      <>
        <SafeAreaView className="flex-1 bg-slate-950">
          <View className="flex-1 px-5 pt-14 pb-6">
            <View className="relative">
              <View className="flex-row items-start justify-between">
                <View className="h-10 w-10" />

                <Text className="text-3xl font-bold text-white">Moto</Text>

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
                    color="#ffffff"
                  />
                </TouchableOpacity>
              </View>

              {menuAcoesAberto ? (
                <>
                  <TouchableOpacity
                    className="absolute inset-0 z-10"
                    activeOpacity={1}
                    onPress={() => setMenuAcoesAberto(false)}
                  />
                  <View className="absolute right-0 top-12 z-20 w-52 rounded-2xl border border-slate-800 bg-slate-900 p-2">
                    <TouchableOpacity
                      className="flex-row items-center rounded-xl px-4 py-3"
                      onPress={irParaNovaMoto}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="add-circle-outline"
                        size={18}
                        color="#22d3ee"
                      />
                      <Text className="ml-3 text-base font-medium text-white">
                        Adicionar moto
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : null}
            </View>

            <View className="flex-1 items-center justify-center px-6">
              <Text className="text-center text-base text-slate-300">
                Nenhuma moto cadastrada.
              </Text>
            </View>
          </View>
        </SafeAreaView>

        <AlertaApp
          visivel={alertaExclusaoAberto}
          titulo="Excluir moto"
          mensagem="Tem certeza que deseja excluir esta moto? Todo o histórico de manutenções e configurações vinculadas também será removido."
          variante="erro"
          textoConfirmar="Excluir"
          textoCancelar="Cancelar"
          mostrarCancelar
          carregando={excluindo}
          aoFechar={() => setAlertaExclusaoAberto(false)}
          aoCancelar={() => setAlertaExclusaoAberto(false)}
          aoConfirmar={() => {
            void executarExclusaoMoto();
          }}
        />

        <AlertaApp
          visivel={alertaSucessoAberto}
          titulo="Sucesso"
          mensagem="Moto excluída com sucesso."
          variante="sucesso"
          textoConfirmar="Fechar"
          aoFechar={() => setAlertaSucessoAberto(false)}
          aoConfirmar={() => setAlertaSucessoAberto(false)}
        />

        <AlertaApp
          visivel={alertaErroAberto}
          titulo="Erro"
          mensagem="Não foi possível excluir a moto."
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
        <View className="flex-1">
          <ScrollView
            contentContainerClassName="px-5 pt-14 pb-6"
            keyboardShouldPersistTaps="handled"
          >
            <View className="relative">
              <View className="flex-row items-start justify-between">
                <View className="h-10 w-10" />

                <TouchableOpacity
                  className="flex-1 items-center px-4"
                  activeOpacity={temMaisDeUmaMoto ? 0.8 : 1}
                  onPress={() => {
                    setMenuAcoesAberto(false);

                    if (temMaisDeUmaMoto) {
                      setSeletorAberto((estadoAtual) => !estadoAtual);
                    }
                  }}
                  disabled={!temMaisDeUmaMoto}
                >
                  <Text className="text-center text-3xl font-bold text-white">
                    {motoSelecionada.marca} {motoSelecionada.modelo}
                  </Text>

                  {temMaisDeUmaMoto ? (
                    <Text className="mt-2 text-sm font-medium text-cyan-400">
                      Toque para trocar de moto
                    </Text>
                  ) : null}
                </TouchableOpacity>

                <TouchableOpacity
                  className="h-10 w-10 items-center justify-center"
                  onPress={() => {
                    setSeletorAberto(false);
                    setMenuAcoesAberto((estadoAtual) => !estadoAtual);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="ellipsis-vertical"
                    size={20}
                    color="#ffffff"
                  />
                </TouchableOpacity>
              </View>

              {seletorAberto ? (
                <View className="mt-4 w-full rounded-2xl border border-slate-800 bg-slate-900 p-3">
                  {motos.map((moto) => {
                    const estaSelecionada = moto.id === motoSelecionada.id;

                    return (
                      <TouchableOpacity
                        key={moto.id}
                        className={`rounded-xl px-4 py-3 ${
                          estaSelecionada ? "bg-slate-800" : "bg-transparent"
                        }`}
                        onPress={() => selecionarMoto(moto)}
                        activeOpacity={0.8}
                      >
                        <Text
                          className={`text-base font-semibold ${
                            estaSelecionada ? "text-cyan-400" : "text-white"
                          }`}
                        >
                          {moto.marca} {moto.modelo}
                        </Text>
                        <Text className="mt-1 text-sm text-slate-400">
                          {moto.ano} • {moto.cor}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ) : null}
            </View>

            <View className="mt-6 h-48 w-full overflow-hidden rounded-3xl">
              <Image
                source={{ uri: motoSelecionada.fotoUri }}
                className="h-full w-full scale-100"
                resizeMode="cover"
              />
            </View>

            <View className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <Text className="text-lg font-bold text-white">
                Resumo da moto
              </Text>

              <View className="mt-4 flex-row gap-3">
                <CardInformacao
                  titulo="Ano"
                  valor={String(motoSelecionada.ano)}
                />
                <CardInformacao titulo="Cor" valor={motoSelecionada.cor} />
              </View>

              <View className="mt-3 flex-row gap-3">
                <CardInformacao
                  titulo="KM atual"
                  valor={`${motoSelecionada.quilometragem.toLocaleString("pt-BR")} km`}
                />
                <CardInformacao
                  titulo="Placa"
                  valor={
                    motoSelecionada.placa
                      ? motoSelecionada.placa
                      : "Não informada"
                  }
                />
              </View>
            </View>

            <View className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <Text className="text-lg font-bold text-white">
                Última manutenção
              </Text>

              {ultimaManutencao ? (
                <View className="mt-4">
                  <Text className="text-base font-bold text-white">
                    {ultimaManutencao.tipo}
                  </Text>

                  <Text className="mt-2 text-sm text-slate-400">
                    Data: {formatarData(ultimaManutencao.data)}
                  </Text>

                  <Text className="mt-1 text-sm text-slate-400">
                    Quilometragem:{" "}
                    {ultimaManutencao.quilometragem.toLocaleString("pt-BR")} km
                  </Text>

                  {typeof ultimaManutencao.custo === "number" ? (
                    <Text className="mt-1 text-sm text-slate-400">
                      Valor: {formatarBRL(ultimaManutencao.custo)}
                    </Text>
                  ) : null}

                  {ultimaManutencao.observacao ? (
                    <Text className="mt-3 text-base text-slate-300">
                      {ultimaManutencao.observacao}
                    </Text>
                  ) : null}
                </View>
              ) : (
                <Text className="mt-3 text-base text-slate-300">
                  Nenhuma manutenção registrada até o momento.
                </Text>
              )}
            </View>
          </ScrollView>

          {menuAcoesAberto ? (
            <>
              <TouchableOpacity
                className="absolute inset-0"
                activeOpacity={1}
                onPress={() => setMenuAcoesAberto(false)}
              />

              <View className="absolute right-5 top-24 w-56 rounded-2xl border border-slate-800 bg-slate-900 p-2">
                <TouchableOpacity
                  className="flex-row items-center rounded-xl px-4 py-3"
                  onPress={irParaNovaMoto}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={18}
                    color="#22d3ee"
                  />
                  <Text className="ml-3 text-base font-medium text-white">
                    Adicionar moto
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="mt-1 flex-row items-center rounded-xl px-4 py-3"
                  onPress={irParaEditarMoto}
                  activeOpacity={0.8}
                >
                  <Ionicons name="create-outline" size={18} color="#22d3ee" />
                  <Text className="ml-3 text-base font-medium text-white">
                    Editar moto
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="mt-1 flex-row items-center rounded-xl px-4 py-3"
                  onPress={confirmarExclusaoMoto}
                  activeOpacity={0.8}
                  disabled={excluindo}
                >
                  {excluindo ? (
                    <ActivityIndicator size="small" color="#ef4444" />
                  ) : (
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  )}

                  <Text className="ml-3 text-base font-medium text-red-400">
                    {excluindo ? "Excluindo..." : "Excluir moto"}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : null}
        </View>
      </SafeAreaView>

      <AlertaApp
        visivel={alertaExclusaoAberto}
        titulo="Excluir moto"
        mensagem="Tem certeza que deseja excluir esta moto? Todo o histórico de manutenções e configurações vinculadas também será removido."
        variante="erro"
        textoConfirmar="Excluir"
        textoCancelar="Cancelar"
        mostrarCancelar
        carregando={excluindo}
        aoFechar={() => setAlertaExclusaoAberto(false)}
        aoCancelar={() => setAlertaExclusaoAberto(false)}
        aoConfirmar={() => {
          void executarExclusaoMoto();
        }}
      />

      <AlertaApp
        visivel={alertaSucessoAberto}
        mensagem="Moto excluída com sucesso."
        variante="sucesso"
        textoConfirmar="Fechar"
        aoFechar={() => setAlertaSucessoAberto(false)}
        aoConfirmar={() => setAlertaSucessoAberto(false)}
      />

      <AlertaApp
        visivel={alertaErroAberto}
        titulo="Erro"
        mensagem="Não foi possível excluir a moto."
        variante="erro"
        textoConfirmar="Fechar"
        aoFechar={() => setAlertaErroAberto(false)}
        aoConfirmar={() => setAlertaErroAberto(false)}
      />
    </>
  );
}

type CardInformacaoProps = {
  titulo: string;
  valor: string;
};

function CardInformacao({ titulo, valor }: CardInformacaoProps) {
  return (
    <View className="flex-1 rounded-2xl bg-slate-800 px-4 py-4">
      <Text className="text-sm font-medium text-slate-400">{titulo}</Text>
      <Text className="mt-2 text-base font-semibold text-white">{valor}</Text>
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
