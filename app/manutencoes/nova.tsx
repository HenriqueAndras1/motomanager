import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { buscarMotoSelecionadaId } from "../../src/servicos/moto-selecionada-firebase";
import { cadastrarManutencao } from "../../src/servicos/manutencoes-firebase";
import { obterMotoPorId } from "../../src/servicos/motos-firebase";
import AlertaApp from "../../src/componentes/AlertaApp";

const ITENS_MANUTENCAO: { secao: string; itens: string[] }[] = [
  {
    secao: "Motor / Lubrificação",
    itens: [
      "Óleo do motor",
      "Filtro de óleo",
      "Filtro de ar",
      "Vela de ignição",
      "Limpeza de TBI / Corpo de borboleta",
      "Regulagem de válvulas",
      "Junta / Retentor (motor)",
      "Troca de fluido de arrefecimento",
      "Radiador (limpeza)",
    ],
  },
  {
    secao: "Transmissão (Relação)",
    itens: [
      "Kit relação (corrente)",
      "Pinhão",
      "Coroa",
      "Lubrificação da corrente",
    ],
  },
  {
    secao: "Embreagem",
    itens: ["Cabo de embreagem", "Embreagem (discos)"],
  },
  {
    secao: "Freios",
    itens: [
      "Pastilha de freio dianteira",
      "Pastilha de freio traseira",
      "Disco de freio",
      "Fluido de freio",
      "Sangria do freio",
      "Cabo de freio / acionamento",
      "Regulagem do freio traseiro",
    ],
  },
  {
    secao: "Suspensão / Direção",
    itens: [
      "Óleo da suspensão",
      "Bengala",
      "Retentores da bengala",
      "Rolamentos da direção",
      "Ajuste de suspensão",
      "Coxins / buchas",
      "Amortecedor traseiro",
      "Guidão",
      "Mesa / alinhamento",
    ],
  },
  {
    secao: "Rodas / Pneus",
    itens: [
      "Pneu dianteiro",
      "Pneu traseiro",
      "Câmara de ar",
      "Balanceamento",
      "Alinhamento",
      "Rolamento da roda dianteira",
      "Rolamento da roda traseira",
      "Válvula do pneu",
    ],
  },
  {
    secao: "Elétrica",
    itens: [
      "Bateria",
      "Lâmpada farol",
      "Lâmpada lanterna",
      "Pisca",
      "Relé",
      "Fusível",
      "Regulador/retificador",
      "Estator",
      "Chicote (reparo)",
    ],
  },
  {
    secao: "Comandos / Cabos",
    itens: [
      "Cabo do acelerador",
      "Ajuste de corrente do acelerador",
      "Manete (embreagem/freio)",
      "Manopla",
      "Pedaleira",
      "Retrovisor",
    ],
  },
  {
    secao: "Ajustes / Revisão",
    itens: [
      "Esticamento / alinhamento da corrente",
      "Revisão geral",
      "Aperto geral / torque",
      "Lavagem",
      "Limpeza e lubrificação",
      "Troca de carenagem/peças",
    ],
  },
];

function hojeISO(): string {
  const dataAtual = new Date();
  const ano = dataAtual.getFullYear();
  const mes = String(dataAtual.getMonth() + 1).padStart(2, "0");
  const dia = String(dataAtual.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function isoParaBR(iso: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    return "";
  }

  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

function brParaISO(br: string): string | null {
  const resultado = br.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!resultado) {
    return null;
  }

  const dia = Number(resultado[1]);
  const mes = Number(resultado[2]);
  const ano = Number(resultado[3]);

  if (ano < 1970 || ano > 2100 || mes < 1 || mes > 12) {
    return null;
  }

  const dataTeste = new Date(ano, mes - 1, dia);

  if (
    dataTeste.getFullYear() !== ano ||
    dataTeste.getMonth() !== mes - 1 ||
    dataTeste.getDate() !== dia
  ) {
    return null;
  }

  return `${String(ano)}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

function mascaraDataBR(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 8);

  if (digitos.length <= 2) {
    return digitos;
  }

  if (digitos.length <= 4) {
    return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
  }

  return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
}

function mascaraKm(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 7);

  if (!digitos) {
    return "";
  }

  return Number(digitos).toLocaleString("pt-BR");
}

function parseKm(valor: string): number {
  const digitos = valor.replace(/\D/g, "");
  return digitos ? Number(digitos) : Number.NaN;
}

function formatarBRL(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function mascaraValor(centsDigits: string): string {
  const digitos = centsDigits.replace(/\D/g, "");
  const centavos = digitos ? Number(digitos) : 0;
  return formatarBRL(centavos / 100);
}

type ErrosFormulario = {
  data?: string;
  quilometragem?: string;
  itens?: string;
  geral?: string;
};

export default function TelaNovaManutencao() {
  const [km, setKm] = useState("");
  const [dataBR, setDataBR] = useState(isoParaBR(hojeISO()));
  const [valorCentavosDigits, setValorCentavosDigits] = useState("");
  const [observacao, setObservacao] = useState("");

  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [modalAberto, setModalAberto] = useState(false);
  const [busca, setBusca] = useState("");
  const [secoesAbertas, setSecoesAbertas] = useState<Set<string>>(
    new Set([ITENS_MANUTENCAO[0]?.secao ?? ""]),
  );

  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<ErrosFormulario>({});
  const [alertaSemMotoAberto, setAlertaSemMotoAberto] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function preencherKmAtual(): Promise<void> {
      try {
        if (km.trim()) {
          return;
        }

        const motoSelecionadaId = await buscarMotoSelecionadaId();

        if (!motoSelecionadaId) {
          return;
        }

        const moto = await obterMotoPorId(motoSelecionadaId);

        if (!ativo || !moto) {
          return;
        }

        if (
          typeof moto.quilometragem === "number" &&
          Number.isFinite(moto.quilometragem) &&
          moto.quilometragem >= 0
        ) {
          setKm(moto.quilometragem.toLocaleString("pt-BR"));
        }
      } catch {
        // ignora
      }
    }

    preencherKmAtual();

    return () => {
      ativo = false;
    };
  }, [km]);

  const listaSelecionados = useMemo(
    () => Array.from(selecionados),
    [selecionados],
  );

  const tipoFinal = useMemo(() => listaSelecionados.join(" + "), [listaSelecionados]);

  const secoesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) {
      return ITENS_MANUTENCAO;
    }

    return ITENS_MANUTENCAO.map((secao) => {
      const itens = secao.itens.filter((item) =>
        item.toLowerCase().includes(termo),
      );

      return {
        ...secao,
        itens,
      };
    }).filter((secao) => secao.itens.length > 0);
  }, [busca]);

  function toggleItem(item: string): void {
    setSelecionados((estadoAnterior) => {
      const proximo = new Set(estadoAnterior);

      if (proximo.has(item)) {
        proximo.delete(item);
      } else {
        proximo.add(item);
      }

      return proximo;
    });

    setErros((estadoAnterior) => ({
      ...estadoAnterior,
      itens: undefined,
      geral: undefined,
    }));
  }

  function toggleSecao(secao: string): void {
    setSecoesAbertas((estadoAnterior) => {
      const proximo = new Set(estadoAnterior);

      if (proximo.has(secao)) {
        proximo.delete(secao);
      } else {
        proximo.add(secao);
      }

      return proximo;
    });
  }

  function voltar(): void {
    router.back();
  }

  async function salvar(): Promise<void> {
    const novosErros: ErrosFormulario = {};

    const motoSelecionadaId = await buscarMotoSelecionadaId();

    if (!motoSelecionadaId) {
      setAlertaSemMotoAberto(true);
      return;
    }

    const kmNumero = parseKm(km);

    if (!Number.isFinite(kmNumero) || kmNumero <= 0) {
      novosErros.quilometragem = "Informe uma quilometragem válida.";
    }

    const dataISO = brParaISO(dataBR);

    if (!dataISO) {
      novosErros.data = "Informe uma data válida em DD/MM/AAAA.";
    }

    if (!tipoFinal.trim()) {
      novosErros.itens = "Selecione pelo menos um item da manutenção.";
    }

    try {
      const moto = await obterMotoPorId(motoSelecionadaId);

      if (
        moto &&
        typeof moto.quilometragem === "number" &&
        Number.isFinite(moto.quilometragem) &&
        Number.isFinite(kmNumero) &&
        kmNumero < moto.quilometragem
      ) {
        novosErros.quilometragem =
          "A quilometragem da manutenção não pode ser menor que a quilometragem atual da moto.";
      }
    } catch {
      // ignora validação extra se não conseguir buscar a moto
    }

    setErros(novosErros);

    if (Object.keys(novosErros).length > 0 || !dataISO) {
      return;
    }

    setSalvando(true);

    try {
      const digits = valorCentavosDigits.replace(/\D/g, "");
      const custoNumero = digits ? Number(digits) / 100 : undefined;

      await cadastrarManutencao({
        motoId: motoSelecionadaId,
        tipo: tipoFinal.trim(),
        data: dataISO,
        quilometragem: kmNumero,
        custo: custoNumero,
        observacao: observacao.trim() ? observacao.trim() : undefined,
      });

      router.replace("/(abas)/manutencoes");
    } catch (erro) {
      console.error("Erro ao cadastrar manutenção:", erro);
      setErros((estadoAnterior) => ({
        ...estadoAnterior,
        geral: "Não foi possível cadastrar a manutenção.",
      }));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <>
      <SafeAreaView className="flex-1 bg-slate-950">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 24 : 0}
        >
          <View className="flex-1">
            <ScrollView
              contentContainerClassName="px-5 pt-14 pb-10"
              keyboardShouldPersistTaps="handled"
            >
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
                    Nova manutenção
                  </Text>
                  <Text className="mt-1 text-center text-base text-slate-300">
                    Registre uma manutenção da moto selecionada.
                  </Text>
                </View>

                <View className="h-10 w-10" />
              </View>

              <View className="gap-3">
                <Text className="text-sm font-medium text-slate-200">
                  Itens da manutenção
                </Text>

                <Pressable
                  onPress={() => setModalAberto(true)}
                  className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3"
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 pr-3">
                      <Text className="text-base font-bold text-white">
                        {listaSelecionados.length > 0
                          ? `${listaSelecionados.length} item(ns) selecionado(s)`
                          : "Selecionar itens"}
                      </Text>
                      <Text className="mt-1 text-sm text-slate-400">
                        Toque para abrir a lista
                      </Text>
                    </View>

                    <Text className="text-xl font-bold text-white">›</Text>
                  </View>
                </Pressable>

                {erros.itens ? (
                  <Text className="text-sm text-red-400">{erros.itens}</Text>
                ) : null}

                {listaSelecionados.length > 0 ? (
                  <View className="flex-row flex-wrap">
                    {listaSelecionados.slice(0, 6).map((item) => (
                      <View
                        key={item}
                        className="mb-2 mr-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-2"
                      >
                        <Text className="font-semibold text-white">{item}</Text>
                      </View>
                    ))}

                    {listaSelecionados.length > 6 ? (
                      <View className="mb-2 mr-2 rounded-full border border-slate-700 bg-slate-900 px-3 py-2">
                        <Text className="font-bold text-white">
                          +{listaSelecionados.length - 6} mais
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ) : null}

                <CampoTexto
                  titulo="Quilometragem"
                  valor={km}
                  aoAlterarTexto={(texto) => {
                    setKm(mascaraKm(texto));
                    setErros((estadoAnterior) => ({
                      ...estadoAnterior,
                      quilometragem: undefined,
                      geral: undefined,
                    }));
                  }}
                  placeholder="10.000"
                  teclado="numeric"
                  erro={erros.quilometragem}
                />

                <CampoTexto
                  titulo="Data (DD/MM/AAAA)"
                  valor={dataBR}
                  aoAlterarTexto={(texto) => {
                    setDataBR(mascaraDataBR(texto));
                    setErros((estadoAnterior) => ({
                      ...estadoAnterior,
                      data: undefined,
                      geral: undefined,
                    }));
                  }}
                  placeholder="25/02/2026"
                  teclado="numeric"
                  erro={erros.data}
                />

                <CampoTexto
                  titulo="Valor"
                  valor={mascaraValor(valorCentavosDigits)}
                  aoAlterarTexto={(texto) => {
                    setValorCentavosDigits(
                      texto.replace(/\D/g, "").slice(0, 10),
                    );
                    setErros((estadoAnterior) => ({
                      ...estadoAnterior,
                      geral: undefined,
                    }));
                  }}
                  placeholder="R$ 0,00"
                  teclado="numeric"
                />

                <CampoTexto
                  titulo="Observação (opcional)"
                  valor={observacao}
                  aoAlterarTexto={(texto) => {
                    setObservacao(texto);
                    setErros((estadoAnterior) => ({
                      ...estadoAnterior,
                      geral: undefined,
                    }));
                  }}
                  placeholder="Ex: óleo e filtro trocados"
                  multiline
                />

                {erros.geral ? (
                  <Text className="text-sm text-red-400">{erros.geral}</Text>
                ) : null}

                <TouchableOpacity
                  className="mt-2 items-center rounded-2xl bg-cyan-500 px-4 py-3"
                  onPress={salvar}
                  activeOpacity={0.8}
                  disabled={salvando}
                >
                  <Text className="text-base font-bold text-slate-950">
                    {salvando ? "Salvando..." : "Salvar manutenção"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <Modal
              visible={modalAberto}
              animationType="slide"
              onRequestClose={() => setModalAberto(false)}
            >
              <SafeAreaView className="flex-1 bg-slate-950">
                <View className="border-b border-slate-800 px-5 py-4">
                  <View className="flex-row items-center justify-between">
                    <TouchableOpacity
                      onPress={() => setModalAberto(false)}
                      activeOpacity={0.8}
                    >
                      <Text className="font-bold text-white">Voltar</Text>
                    </TouchableOpacity>

                    <Text className="text-lg font-bold text-white">
                      Selecionar itens
                    </Text>

                    <TouchableOpacity
                      onPress={() => {
                        setBusca("");
                        setSelecionados(new Set());
                      }}
                      activeOpacity={0.8}
                    >
                      <Text className="font-bold text-white">Limpar</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View className="px-5 py-4">
                  <TextInput
                    value={busca}
                    onChangeText={setBusca}
                    placeholder="Pesquisar (óleo, filtro, pastilha...)"
                    placeholderTextColor="#94a3b8"
                    className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-base text-white"
                  />

                  <Text className="mt-3 text-sm text-slate-400">
                    Marcados: {selecionados.size}
                  </Text>
                </View>

                <ScrollView contentContainerClassName="px-5 pb-28">
                  {secoesFiltradas.map((secao) => {
                    const aberta = secoesAbertas.has(secao.secao);

                    return (
                      <View key={secao.secao} className="mb-3">
                        <TouchableOpacity
                          onPress={() => toggleSecao(secao.secao)}
                          activeOpacity={0.8}
                          className={`flex-row items-center justify-between rounded-2xl border-2 px-4 py-3 ${
                            aberta
                              ? "border-cyan-500 bg-slate-950"
                              : "border-slate-700 bg-slate-900"
                          }`}
                        >
                          <Text className="flex-1 font-bold text-white">
                            {secao.secao}
                          </Text>

                          <View className="ml-3 flex-row items-center">
                            <View className="mr-3 rounded-full border border-slate-700 bg-slate-900 px-3 py-1">
                              <Text className="font-bold text-white">
                                {
                                  secao.itens.filter((item) =>
                                    selecionados.has(item),
                                  ).length
                                }
                              </Text>
                            </View>

                            <Text
                              className={`text-lg font-bold ${
                                aberta ? "text-cyan-400" : "text-white"
                              }`}
                            >
                              {aberta ? "▾" : "▸"}
                            </Text>
                          </View>
                        </TouchableOpacity>

                        {aberta ? (
                          <View className="mt-2 overflow-hidden rounded-2xl border border-slate-700">
                            {secao.itens.map((item, indice) => {
                              const marcado = selecionados.has(item);

                              return (
                                <TouchableOpacity
                                  key={item}
                                  onPress={() => toggleItem(item)}
                                  activeOpacity={0.8}
                                  className={`flex-row items-center justify-between px-4 py-3 ${
                                    marcado ? "bg-cyan-500" : "bg-slate-900"
                                  } ${
                                    indice > 0 ? "border-t border-slate-700" : ""
                                  }`}
                                >
                                  <Text className="flex-1 font-semibold text-white">
                                    {item}
                                  </Text>

                                  <Text className="ml-3 font-bold text-white">
                                    {marcado ? "✓" : ""}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        ) : null}
                      </View>
                    );
                  })}
                </ScrollView>

                <View className="absolute bottom-0 left-0 right-0 border-t border-slate-800 bg-slate-950 px-5 py-4">
                  <TouchableOpacity
                    onPress={() => setModalAberto(false)}
                    activeOpacity={0.8}
                    className="items-center rounded-2xl bg-cyan-500 px-4 py-3"
                  >
                    <Text className="text-base font-bold text-slate-950">
                      Concluir ({selecionados.size})
                    </Text>
                  </TouchableOpacity>
                </View>
              </SafeAreaView>
            </Modal>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <AlertaApp
        visivel={alertaSemMotoAberto}
        titulo="Erro"
        mensagem="Nenhuma moto selecionada."
        variante="erro"
        textoConfirmar="Fechar"
        aoFechar={() => setAlertaSemMotoAberto(false)}
        aoConfirmar={() => setAlertaSemMotoAberto(false)}
      />
    </>
  );
}

type CampoTextoProps = {
  titulo: string;
  valor: string;
  aoAlterarTexto: (texto: string) => void;
  placeholder: string;
  erro?: string;
  teclado?: "default" | "numeric";
  multiline?: boolean;
};

function CampoTexto({
  titulo,
  valor,
  aoAlterarTexto,
  placeholder,
  erro,
  teclado = "default",
  multiline = false,
}: CampoTextoProps) {
  return (
    <View>
      <Text className="mb-2 text-sm font-medium text-slate-200">{titulo}</Text>

      <TextInput
        className={`rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-base text-white ${
          multiline ? "min-h-28" : ""
        }`}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        value={valor}
        onChangeText={aoAlterarTexto}
        keyboardType={teclado}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "auto"}
      />

      {erro ? <Text className="mt-2 text-sm text-red-400">{erro}</Text> : null}
    </View>
  );
}