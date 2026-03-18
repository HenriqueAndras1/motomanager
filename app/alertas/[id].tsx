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
import AlertaApp from "../../src/componentes/AlertaApp";
import {
  concluirAlerta,
  excluirAlerta,
  obterAlertaPorId,
  reativarAlerta,
} from "../../src/servicos/alertas-firebase";
import { useTema } from "../../src/contextos/tema-contexto";
import { Alerta } from "../../src/tipos/alerta";

type ParametrosRota = {
  id?: string;
};

export default function TelaDetalhesAlerta() {
  const { cores } = useTema();
  const { id } = useLocalSearchParams<ParametrosRota>();

  const [alerta, setAlerta] = useState<Alerta | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [menuAcoesAberto, setMenuAcoesAberto] = useState(false);

  const [alertaConfirmarConclusaoAberto, setAlertaConfirmarConclusaoAberto] =
    useState(false);
  const [alertaConfirmarReativacaoAberto, setAlertaConfirmarReativacaoAberto] =
    useState(false);
  const [alertaConfirmarExclusaoAberto, setAlertaConfirmarExclusaoAberto] =
    useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const [alertaErroAberto, setAlertaErroAberto] = useState(false);

  useEffect(() => {
    async function carregar(): Promise<void> {
      if (!id) {
        setCarregando(false);
        return;
      }

      try {
        const resultado = await obterAlertaPorId(id);
        setAlerta(resultado);
      } finally {
        setCarregando(false);
      }
    }

    void carregar();
  }, [id]);

  function voltar(): void {
    router.replace("/(abas)/alertas");
  }

  function irParaEditar(): void {
    if (!id) {
      return;
    }

    setMenuAcoesAberto(false);
    router.push(`/alertas/editar?id=${id}`);
  }

  function abrirConfirmacaoConclusao(): void {
    if (!alerta || processando) {
      return;
    }

    setMenuAcoesAberto(false);
    setAlertaConfirmarConclusaoAberto(true);
  }

  function abrirConfirmacaoReativacao(): void {
    if (!alerta || processando) {
      return;
    }

    setMenuAcoesAberto(false);
    setAlertaConfirmarReativacaoAberto(true);
  }

  function abrirConfirmacaoExclusao(): void {
    if (!alerta || processando) {
      return;
    }

    setMenuAcoesAberto(false);
    setAlertaConfirmarExclusaoAberto(true);
  }

  async function executarConclusao(): Promise<void> {
    if (!id) {
      return;
    }

    setProcessando(true);

    try {
      await concluirAlerta(id);
      const atualizado = await obterAlertaPorId(id);
      setAlerta(atualizado);
      setAlertaConfirmarConclusaoAberto(false);
    } catch (erro) {
      console.error("Erro ao concluir alerta:", erro);
      setAlertaConfirmarConclusaoAberto(false);
      setMensagemErro("Não foi possível concluir o alerta.");
      setAlertaErroAberto(true);
    } finally {
      setProcessando(false);
    }
  }

  async function executarReativacao(): Promise<void> {
    if (!id) {
      return;
    }

    setProcessando(true);

    try {
      await reativarAlerta(id);
      const atualizado = await obterAlertaPorId(id);
      setAlerta(atualizado);
      setAlertaConfirmarReativacaoAberto(false);
    } catch (erro) {
      console.error("Erro ao reativar alerta:", erro);
      setAlertaConfirmarReativacaoAberto(false);
      setMensagemErro("Não foi possível reativar o alerta.");
      setAlertaErroAberto(true);
    } finally {
      setProcessando(false);
    }
  }

  async function executarExclusao(): Promise<void> {
    if (!id) {
      return;
    }

    setProcessando(true);

    try {
      await excluirAlerta(id);
      setAlertaConfirmarExclusaoAberto(false);
      router.replace("/(abas)/alertas");
    } catch (erro) {
      console.error("Erro ao excluir alerta:", erro);
      setAlertaConfirmarExclusaoAberto(false);
      setMensagemErro("Não foi possível excluir o alerta.");
      setAlertaErroAberto(true);
    } finally {
      setProcessando(false);
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
          Carregando alerta...
        </Text>
      </SafeAreaView>
    );
  }

  if (!alerta) {
    return (
      <SafeAreaView className="flex-1" style={{ backgroundColor: cores.fundo }}>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-base" style={{ color: cores.textoSecundario }}>
            Alerta não encontrado.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const alertaAtivo = alerta.ativo && !alerta.concluido;

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
                    Alerta
                  </Text>
                  <Text
                    className="mt-1 text-center text-base"
                    style={{ color: cores.textoSecundario }}
                  >
                    Detalhes do alerta
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
                <View className="flex-row items-start justify-between">
                  <Text
                    className="flex-1 pr-3 text-xl font-bold"
                    style={{ color: cores.texto }}
                  >
                    {alerta.titulo}
                  </Text>

                  <View
                    className="rounded-full px-3 py-1"
                    style={{
                      backgroundColor: alertaAtivo
                        ? `${cores.primaria}26`
                        : cores.borda,
                    }}
                  >
                    <Text
                      className="text-xs font-bold"
                      style={{
                        color: alertaAtivo
                          ? cores.primaria
                          : cores.textoSecundario,
                      }}
                    >
                      {alertaAtivo ? "ATIVO" : "HISTÓRICO"}
                    </Text>
                  </View>
                </View>

                <View className="mt-4">
                  <LinhaInformacao
                    titulo="Tipo"
                    valor={
                      alerta.tipo === "manutencao_km"
                        ? "Manutenção por quilometragem"
                        : "Alerta por data"
                    }
                    cores={cores}
                  />

                  {alerta.tipo === "manutencao_km" ? (
                    <>
                      <LinhaInformacao
                        titulo="Quilometragem atual"
                        valor={
                          typeof alerta.quilometragemAtual === "number"
                            ? `${alerta.quilometragemAtual.toLocaleString("pt-BR")} km`
                            : "Não informada"
                        }
                        cores={cores}
                      />
                      <LinhaInformacao
                        titulo="Quilometragem alvo"
                        valor={
                          typeof alerta.quilometragemObjetivo === "number"
                            ? `${alerta.quilometragemObjetivo.toLocaleString("pt-BR")} km`
                            : "Não informada"
                        }
                        cores={cores}
                      />
                      <LinhaInformacao
                        titulo="Quilometragem faltante"
                        valor={
                          typeof alerta.quilometragemFaltante === "number"
                            ? `${alerta.quilometragemFaltante.toLocaleString("pt-BR")} km`
                            : "Não informada"
                        }
                        cores={cores}
                      />
                      <LinhaInformacao
                        titulo="Uso médio"
                        valor={
                          typeof alerta.usoMedioValor === "number" &&
                          alerta.usoMedioPeriodo
                            ? `${alerta.usoMedioValor.toLocaleString(
                                "pt-BR",
                              )} km por ${formatarPeriodo(alerta.usoMedioPeriodo)}`
                            : "Não informado"
                        }
                        cores={cores}
                      />
                      <LinhaInformacao
                        titulo="Data prevista"
                        valor={
                          alerta.dataPrevista
                            ? formatarData(alerta.dataPrevista)
                            : "Não calculada"
                        }
                        cores={cores}
                      />
                    </>
                  ) : (
                    <LinhaInformacao
                      titulo="Data alvo"
                      valor={
                        alerta.dataAlvo
                          ? formatarData(alerta.dataAlvo)
                          : "Não informada"
                      }
                      cores={cores}
                    />
                  )}

                  <LinhaInformacao
                    titulo="Observação"
                    valor={alerta.observacao ? alerta.observacao : "Não informada"}
                    cores={cores}
                  />

                  <LinhaInformacao
                    titulo="Criado em"
                    valor={formatarDataHora(alerta.criadoEm)}
                    cores={cores}
                  />

                  <LinhaInformacao
                    titulo="Atualizado em"
                    valor={formatarDataHora(alerta.atualizadoEm)}
                    cores={cores}
                  />

                  <LinhaInformacao
                    titulo="Concluído em"
                    valor={
                      alerta.concluidoEm
                        ? formatarDataHora(alerta.concluidoEm)
                        : "Ainda não concluído"
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
                    Editar alerta
                  </Text>
                </TouchableOpacity>

                {alertaAtivo ? (
                  <TouchableOpacity
                    className="mt-1 flex-row items-center rounded-xl px-4 py-3"
                    onPress={abrirConfirmacaoConclusao}
                    activeOpacity={0.8}
                    disabled={processando}
                  >
                    {processando ? (
                      <ActivityIndicator size="small" color="#f59e0b" />
                    ) : (
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={18}
                        color="#f59e0b"
                      />
                    )}

                    <Text className="ml-3 text-base font-medium text-amber-400">
                      {processando ? "Processando..." : "Concluir alerta"}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    className="mt-1 flex-row items-center rounded-xl px-4 py-3"
                    onPress={abrirConfirmacaoReativacao}
                    activeOpacity={0.8}
                    disabled={processando}
                  >
                    {processando ? (
                      <ActivityIndicator size="small" color="#10b981" />
                    ) : (
                      <Ionicons
                        name="refresh-circle-outline"
                        size={18}
                        color="#10b981"
                      />
                    )}

                    <Text className="ml-3 text-base font-medium text-emerald-400">
                      {processando ? "Processando..." : "Reativar alerta"}
                    </Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  className="mt-1 flex-row items-center rounded-xl px-4 py-3"
                  onPress={abrirConfirmacaoExclusao}
                  activeOpacity={0.8}
                  disabled={processando}
                >
                  {processando ? (
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
                    {processando ? "Processando..." : "Excluir alerta"}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : null}
        </View>
      </SafeAreaView>

      <AlertaApp
        visivel={alertaConfirmarConclusaoAberto}
        titulo="Concluir alerta"
        mensagem="Deseja concluir este alerta e movê-lo para o histórico?"
        variante="aviso"
        textoConfirmar="Concluir"
        textoCancelar="Cancelar"
        mostrarCancelar
        carregando={processando}
        aoFechar={() => setAlertaConfirmarConclusaoAberto(false)}
        aoCancelar={() => setAlertaConfirmarConclusaoAberto(false)}
        aoConfirmar={() => {
          void executarConclusao();
        }}
      />

      <AlertaApp
        visivel={alertaConfirmarReativacaoAberto}
        titulo="Reativar alerta"
        mensagem="Deseja reativar este alerta?"
        variante="sucesso"
        textoConfirmar="Reativar"
        textoCancelar="Cancelar"
        mostrarCancelar
        carregando={processando}
        aoFechar={() => setAlertaConfirmarReativacaoAberto(false)}
        aoCancelar={() => setAlertaConfirmarReativacaoAberto(false)}
        aoConfirmar={() => {
          void executarReativacao();
        }}
      />

      <AlertaApp
        visivel={alertaConfirmarExclusaoAberto}
        titulo="Excluir alerta"
        mensagem="Tem certeza que deseja excluir este alerta?"
        variante="erro"
        textoConfirmar="Excluir"
        textoCancelar="Cancelar"
        mostrarCancelar
        carregando={processando}
        aoFechar={() => setAlertaConfirmarExclusaoAberto(false)}
        aoCancelar={() => setAlertaConfirmarExclusaoAberto(false)}
        aoConfirmar={() => {
          void executarExclusao();
        }}
      />

      <AlertaApp
        visivel={alertaErroAberto}
        titulo="Erro"
        mensagem={mensagemErro}
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

function formatarPeriodo(periodo: "dia" | "semana" | "mes"): string {
  if (periodo === "dia") {
    return "dia";
  }

  if (periodo === "semana") {
    return "semana";
  }

  return "mês";
}

function formatarData(data: string): string {
  const dataFormatada = new Date(`${data}T00:00:00`);
  return dataFormatada.toLocaleDateString("pt-BR");
}

function formatarDataHora(data: string): string {
  return new Date(data).toLocaleString("pt-BR");
}