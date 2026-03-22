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
import { useTema } from "../../src/contextos/tema-contexto";
import { Moto } from "../../src/tipos/moto";
import { Manutencao } from "../../src/tipos/manutencao";

export default function TelaMoto() {
  const { cores } = useTema();

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
  const [alturaTela, setAlturaTela] = useState(0);
  const [alturaConteudo, setAlturaConteudo] = useState(0);

  const temMaisDeUmaMoto = useMemo(() => motos.length > 1, [motos.length]);
  const devePermitirScroll = alturaConteudo > alturaTela;

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

      void carregarDados();
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
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: cores.fundo }}
      >
        <ActivityIndicator size="large" color={cores.primaria} />
        <Text
          className="mt-4 text-base"
          style={{ color: cores.textoSecundario }}
        >
          Carregando moto...
        </Text>
      </SafeAreaView>
    );
  }

  if (!motoSelecionada) {
    return (
      <>
        <SafeAreaView className="flex-1" style={{ backgroundColor: cores.fundo }}>
          <View className="flex-1 px-5 pt-14 pb-6">
            <View className="relative">
              <View className="flex-row items-start justify-between">
                <View className="h-10 w-10" />

                <Text
                  className="text-3xl font-bold"
                  style={{ color: cores.texto }}
                >
                  Moto
                </Text>

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

              {menuAcoesAberto ? (
                <>
                  <TouchableOpacity
                    className="absolute inset-0 z-10"
                    activeOpacity={1}
                    onPress={() => setMenuAcoesAberto(false)}
                  />
                  <View
                    className="absolute right-0 top-12 z-20 w-52 rounded-2xl p-2"
                    style={{
                      borderWidth: 1,
                      borderColor: cores.borda,
                      backgroundColor: cores.fundoCard,
                    }}
                  >
                    <TouchableOpacity
                      className="flex-row items-center rounded-xl px-4 py-3"
                      onPress={irParaNovaMoto}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="add-circle-outline"
                        size={18}
                        color={cores.primaria}
                      />
                      <Text
                        className="ml-3 text-base font-medium"
                        style={{ color: cores.texto }}
                      >
                        Adicionar moto
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : null}
            </View>

            <View className="flex-1 items-center justify-center px-6">
              <Text
                className="text-center text-base"
                style={{ color: cores.textoSecundario }}
              >
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
      <SafeAreaView className="flex-1" style={{ backgroundColor: cores.fundo }}>
        <View
          className="flex-1"
          onLayout={(evento) => {
            setAlturaTela(evento.nativeEvent.layout.height);
          }}
        >
          <ScrollView
            contentContainerClassName="px-5 pt-14 pb-6"
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            scrollEnabled={devePermitirScroll}
            showsVerticalScrollIndicator={devePermitirScroll}
            onContentSizeChange={(_, altura) => {
              setAlturaConteudo(altura);
            }}
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
                  <Text
                    className="text-center text-3xl font-bold"
                    style={{ color: cores.texto }}
                  >
                    {motoSelecionada.marca} {motoSelecionada.modelo}
                  </Text>

                  {temMaisDeUmaMoto ? (
                    <Text
                      className="mt-2 text-sm font-medium"
                      style={{ color: cores.primaria }}
                    >
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
                    color={cores.texto}
                  />
                </TouchableOpacity>
              </View>

              {seletorAberto ? (
                <View
                  className="mt-4 w-full rounded-2xl p-3"
                  style={{
                    borderWidth: 1,
                    borderColor: cores.borda,
                    backgroundColor: cores.fundoCard,
                  }}
                >
                  {motos.map((moto) => {
                    const estaSelecionada = moto.id === motoSelecionada.id;

                    return (
                      <TouchableOpacity
                        key={moto.id}
                        className="rounded-xl px-4 py-3"
                        style={{
                          backgroundColor: estaSelecionada
                            ? cores.borda
                            : "transparent",
                        }}
                        onPress={() => selecionarMoto(moto)}
                        activeOpacity={0.8}
                      >
                        <Text
                          className="text-base font-semibold"
                          style={{
                            color: estaSelecionada
                              ? cores.primaria
                              : cores.texto,
                          }}
                        >
                          {moto.marca} {moto.modelo}
                        </Text>
                        <Text
                          className="mt-1 text-sm"
                          style={{ color: cores.textoSuave }}
                        >
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

            <View
              className="mt-6 rounded-2xl p-5"
              style={{
                borderWidth: 1,
                borderColor: cores.borda,
                backgroundColor: cores.fundoCard,
              }}
            >
              <Text
                className="text-lg font-bold"
                style={{ color: cores.texto }}
              >
                Resumo da Moto
              </Text>

              <View className="mt-5 flex-row gap-6">
                <CardInformacao
                  titulo="Ano"
                  valor={String(motoSelecionada.ano)}
                  cores={cores}
                />
                <CardInformacao
                  titulo="Cor"
                  valor={motoSelecionada.cor}
                  cores={cores}
                />
              </View>

              <View className="mt-5 flex-row gap-6">
                <CardInformacao
                  titulo="KM atual"
                  valor={`${motoSelecionada.quilometragem.toLocaleString("pt-BR")} km`}
                  cores={cores}
                />
                <CardInformacao
                  titulo="Placa"
                  valor={
                    motoSelecionada.placa
                      ? motoSelecionada.placa
                      : "Não informada"
                  }
                  cores={cores}
                />
              </View>
            </View>

            <View
              className="mt-6 rounded-2xl p-5"
              style={{
                borderWidth: 1,
                borderColor: cores.borda,
                backgroundColor: cores.fundoCard,
              }}
            >
              <Text
                className="text-lg font-bold"
                style={{ color: cores.texto }}
              >
                Última Manutenção
              </Text>

              {ultimaManutencao ? (
                <View className="mt-4">
                  <Text
                    className="text-base font-bold"
                    style={{ color: cores.texto }}
                  >
                    {ultimaManutencao.tipo}
                  </Text>

                  <Text
                    className="mt-3 text-sm"
                    style={{ color: cores.textoSuave }}
                  >
                    Data: {formatarData(ultimaManutencao.data)}
                  </Text>

                  <Text
                    className="mt-2 text-sm"
                    style={{ color: cores.textoSuave }}
                  >
                    Quilometragem:{" "}
                    {ultimaManutencao.quilometragem.toLocaleString("pt-BR")} km
                  </Text>

                  {typeof ultimaManutencao.custo === "number" ? (
                    <Text
                      className="mt-2 text-sm"
                      style={{ color: cores.textoSuave }}
                    >
                      Valor: {formatarBRL(ultimaManutencao.custo)}
                    </Text>
                  ) : null}

                  {ultimaManutencao.observacao ? (
                    <Text
                      className="mt-3 text-base"
                      style={{ color: cores.textoSecundario }}
                    >
                      {ultimaManutencao.observacao}
                    </Text>
                  ) : null}
                </View>
              ) : (
                <Text
                  className="mt-4 text-base"
                  style={{ color: cores.textoSecundario }}
                >
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
                  onPress={irParaNovaMoto}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={18}
                    color={cores.primaria}
                  />
                  <Text
                    className="ml-3 text-base font-medium"
                    style={{ color: cores.texto }}
                  >
                    Adicionar moto
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="mt-1 flex-row items-center rounded-xl px-4 py-3"
                  onPress={irParaEditarMoto}
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
  cores: {
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
};

function CardInformacao({ titulo, valor, cores }: CardInformacaoProps) {
  return (
    <View className="flex-1">
      <Text
        className="text-sm font-medium"
        style={{ color: cores.textoSuave }}
      >
        {titulo}
      </Text>
      <Text
        className="mt-2 text-base font-semibold"
        style={{ color: cores.texto }}
      >
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