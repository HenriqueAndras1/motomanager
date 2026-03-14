import { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  atualizarAlerta,
  obterAlertaPorId,
} from "../../src/servicos/alertas-firebase";
import { obterMotoPorId } from "../../src/servicos/motos-firebase";
import { Alerta, PeriodoUso, TipoAlerta } from "../../src/tipos/alerta";
import { Moto } from "../../src/tipos/moto";

type ParametrosRota = {
  id?: string;
};

type ErrosFormulario = {
  titulo?: string;
  quilometragemObjetivo?: string;
  usoMedioValor?: string;
  dataAlvo?: string;
  geral?: string;
};

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

function mascaraNumero(valor: string): string {
  return valor.replace(/\D/g, "");
}

function calcularKmPorDia(
  usoMedioValor: number,
  usoMedioPeriodo: PeriodoUso,
): number {
  if (usoMedioPeriodo === "dia") {
    return usoMedioValor;
  }

  if (usoMedioPeriodo === "semana") {
    return usoMedioValor / 7;
  }

  return usoMedioValor / 30;
}

function calcularDataPrevistaTexto(
  quilometragemAtual: number,
  quilometragemObjetivo: number,
  usoMedioValor: number,
  usoMedioPeriodo: PeriodoUso,
): string {
  const faltante = Math.max(quilometragemObjetivo - quilometragemAtual, 0);
  const kmPorDia = calcularKmPorDia(usoMedioValor, usoMedioPeriodo);

  if (faltante <= 0) {
    return "Meta já atingida.";
  }

  if (kmPorDia <= 0) {
    return "Previsão indisponível.";
  }

  const dias = Math.ceil(faltante / kmPorDia);
  const data = new Date();
  data.setDate(data.getDate() + dias);

  return `Faltam ${faltante.toLocaleString("pt-BR")} km • previsão aproximada em ${data.toLocaleDateString("pt-BR")}`;
}

export default function TelaEditarAlerta() {
  const { id } = useLocalSearchParams<ParametrosRota>();

  const [tipo, setTipo] = useState<TipoAlerta>("manutencao_km");
  const [titulo, setTitulo] = useState("");
  const [observacao, setObservacao] = useState("");
  const [ativo, setAtivo] = useState(true);

  const [quilometragemObjetivo, setQuilometragemObjetivo] = useState("");
  const [usoMedioValor, setUsoMedioValor] = useState("");
  const [usoMedioPeriodo, setUsoMedioPeriodo] = useState<PeriodoUso>("semana");

  const [dataAlvoBR, setDataAlvoBR] = useState("");

  const [motoSelecionada, setMotoSelecionada] = useState<Moto | null>(null);
  const [alertaAtual, setAlertaAtual] = useState<Alerta | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<ErrosFormulario>({});

  useEffect(() => {
    let ativoTela = true;

    async function carregar(): Promise<void> {
      if (!id) {
        if (ativoTela) {
          setErros({ geral: "Alerta não encontrado." });
          setCarregando(false);
        }
        return;
      }

      try {
        const alerta = await obterAlertaPorId(id);

        if (!ativoTela) {
          return;
        }

        if (!alerta) {
          setErros({ geral: "Alerta não encontrado." });
          setCarregando(false);
          return;
        }

        setAlertaAtual(alerta);
        setTipo(alerta.tipo);
        setTitulo(alerta.titulo ?? "");
        setObservacao(alerta.observacao ?? "");
        setAtivo(Boolean(alerta.ativo));

        if (alerta.tipo === "manutencao_km") {
          setQuilometragemObjetivo(
            typeof alerta.quilometragemObjetivo === "number"
              ? String(alerta.quilometragemObjetivo)
              : "",
          );
          setUsoMedioValor(
            typeof alerta.usoMedioValor === "number"
              ? String(alerta.usoMedioValor)
              : "",
          );
          setUsoMedioPeriodo(alerta.usoMedioPeriodo ?? "semana");
        } else {
          setDataAlvoBR(alerta.dataAlvo ? isoParaBR(alerta.dataAlvo) : "");
        }

        const moto = await obterMotoPorId(alerta.motoId);

        if (!ativoTela) {
          return;
        }

        if (!moto) {
          setErros({ geral: "Não foi possível carregar a moto do alerta." });
          setCarregando(false);
          return;
        }

        setMotoSelecionada(moto);
      } catch (erro) {
        console.error("Erro ao carregar alerta:", erro);

        if (ativoTela) {
          setErros({ geral: "Não foi possível carregar o alerta." });
        }
      } finally {
        if (ativoTela) {
          setCarregando(false);
        }
      }
    }

    carregar();

    return () => {
      ativoTela = false;
    };
  }, [id]);

  const previewManutencao = useMemo(() => {
    const kmObjetivo = Number(quilometragemObjetivo);
    const usoValor = Number(usoMedioValor);
    const kmAtualEstimado = motoSelecionada?.quilometragem ?? Number.NaN;

    if (
      !Number.isFinite(kmObjetivo) ||
      kmObjetivo <= 0 ||
      !Number.isFinite(usoValor) ||
      usoValor <= 0 ||
      !Number.isFinite(kmAtualEstimado)
    ) {
      return null;
    }

    return calcularDataPrevistaTexto(
      kmAtualEstimado,
      kmObjetivo,
      usoValor,
      usoMedioPeriodo,
    );
  }, [quilometragemObjetivo, usoMedioValor, usoMedioPeriodo, motoSelecionada]);

  function voltar(): void {
    router.back();
  }

  async function salvar(): Promise<void> {
    const novosErros: ErrosFormulario = {};

    if (!titulo.trim()) {
      novosErros.titulo = "Informe o título do alerta.";
    }

    if (!motoSelecionada || !alertaAtual) {
      novosErros.geral = "Não foi possível carregar os dados do alerta.";
    }

    if (tipo === "manutencao_km") {
      const kmObjetivoNumero = Number(quilometragemObjetivo);
      const kmAtualMoto = motoSelecionada?.quilometragem ?? Number.NaN;

      if (!quilometragemObjetivo.trim()) {
        novosErros.quilometragemObjetivo = "Informe a quilometragem alvo.";
      } else if (Number.isNaN(kmObjetivoNumero)) {
        novosErros.quilometragemObjetivo =
          "A quilometragem alvo precisa ser numérica.";
      } else if (
        Number.isFinite(kmAtualMoto) &&
        kmObjetivoNumero <= kmAtualMoto
      ) {
        novosErros.quilometragemObjetivo =
          "A quilometragem alvo precisa ser maior que a quilometragem atual da moto.";
      }

      if (!usoMedioValor.trim()) {
        novosErros.usoMedioValor = "Informe o uso médio.";
      } else if (Number.isNaN(Number(usoMedioValor))) {
        novosErros.usoMedioValor = "O uso médio precisa ser numérico.";
      }
    }

    if (tipo === "data") {
      const dataISO = brParaISO(dataAlvoBR);

      if (!dataISO) {
        novosErros.dataAlvo = "Informe uma data válida em DD/MM/AAAA.";
      }
    }

    setErros(novosErros);

    if (Object.keys(novosErros).length > 0 || !id || !motoSelecionada || !alertaAtual) {
      return;
    }

    setSalvando(true);

    try {
      if (tipo === "manutencao_km") {
        await atualizarAlerta(id, {
          tipo: "manutencao_km",
          titulo: titulo.trim(),
          observacao: observacao.trim() ? observacao.trim() : "",
          ativo,
          quilometragemAtual: motoSelecionada.quilometragem,
          quilometragemObjetivo: Number(quilometragemObjetivo),
          usoMedioValor: Number(usoMedioValor),
          usoMedioPeriodo,
        });
      } else {
        await atualizarAlerta(id, {
          tipo: "data",
          titulo: titulo.trim(),
          observacao: observacao.trim() ? observacao.trim() : "",
          ativo,
          dataAlvo: brParaISO(dataAlvoBR)!,
        });
      }

      router.replace("/(abas)/alertas");
    } catch (erro) {
      console.error("Erro ao atualizar alerta:", erro);
      setErros((estadoAnterior) => ({
        ...estadoAnterior,
        geral: "Não foi possível atualizar o alerta.",
      }));
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-slate-950">
        <Text className="text-base text-slate-300">Carregando alerta...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView
        contentContainerClassName="px-5 pt-14 pb-6"
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
              Editar alerta
            </Text>
            <Text className="mt-1 text-center text-base text-slate-300">
              Atualize os dados do alerta
            </Text>
          </View>

          <View className="h-10 w-10" />
        </View>

        <View className="gap-3">
          <CampoTexto
            titulo="Título"
            valor={titulo}
            aoAlterarTexto={(texto) => {
              setTitulo(texto);
              setErros((estadoAnterior) => ({
                ...estadoAnterior,
                titulo: undefined,
                geral: undefined,
              }));
            }}
            placeholder="Ex: Troca de óleo"
            erro={erros.titulo}
          />

          <View>
            <Text className="mb-2 text-sm font-medium text-slate-200">
              Tipo do alerta
            </Text>

            <View className="flex-row gap-3">
              <BotaoTipo
                titulo="Manutenção por KM"
                selecionado={tipo === "manutencao_km"}
                onPress={() => setTipo("manutencao_km")}
              />
              <BotaoTipo
                titulo="Por data"
                selecionado={tipo === "data"}
                onPress={() => setTipo("data")}
              />
            </View>
          </View>

          {tipo === "manutencao_km" ? (
            <>
              <View className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4">
                <Text className="text-sm font-medium text-slate-400">
                  Quilometragem atual da moto
                </Text>
                <Text className="mt-1 text-base font-bold text-white">
                  {motoSelecionada
                    ? `${motoSelecionada.quilometragem.toLocaleString("pt-BR")} km`
                    : "Carregando..."}
                </Text>

                <Text className="mt-3 text-sm font-medium text-slate-400">
                  A meta precisa ser maior que a quilometragem atual.
                </Text>
              </View>

              <CampoTexto
                titulo="Quilometragem alvo"
                valor={quilometragemObjetivo}
                aoAlterarTexto={(texto) => {
                  setQuilometragemObjetivo(mascaraNumero(texto));
                  setErros((estadoAnterior) => ({
                    ...estadoAnterior,
                    quilometragemObjetivo: undefined,
                    geral: undefined,
                  }));
                }}
                placeholder="Ex: 18000"
                teclado="numeric"
                erro={erros.quilometragemObjetivo}
              />

              {motoSelecionada && quilometragemObjetivo ? (
                <View className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4">
                  <Text className="text-sm font-medium text-slate-400">
                    Comparativo
                  </Text>
                  <Text className="mt-1 text-base text-white">
                    Atual: {motoSelecionada.quilometragem.toLocaleString("pt-BR")} km
                  </Text>
                  <Text className="mt-1 text-base text-white">
                    Alvo: {Number(quilometragemObjetivo).toLocaleString("pt-BR")} km
                  </Text>
                </View>
              ) : null}

              <View>
                <Text className="mb-2 text-sm font-medium text-slate-200">
                  Uso médio
                </Text>

                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <TextInput
                      className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-base text-white"
                      placeholder="Ex: 100"
                      placeholderTextColor="#94a3b8"
                      value={usoMedioValor}
                      onChangeText={(texto) => {
                        setUsoMedioValor(mascaraNumero(texto));
                        setErros((estadoAnterior) => ({
                          ...estadoAnterior,
                          usoMedioValor: undefined,
                          geral: undefined,
                        }));
                      }}
                      keyboardType="numeric"
                    />
                  </View>

                  <View className="flex-1">
                    <SeletorPeriodo
                      valor={usoMedioPeriodo}
                      aoSelecionar={setUsoMedioPeriodo}
                    />
                  </View>
                </View>

                {erros.usoMedioValor ? (
                  <Text className="mt-2 text-sm text-red-400">
                    {erros.usoMedioValor}
                  </Text>
                ) : null}
              </View>

              {previewManutencao ? (
                <View className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-4">
                  <Text className="text-sm font-medium text-cyan-300">
                    Previsão aproximada
                  </Text>
                  <Text className="mt-1 text-base text-white">
                    {previewManutencao}
                  </Text>
                </View>
              ) : null}
            </>
          ) : (
            <CampoTexto
              titulo="Data alvo (DD/MM/AAAA)"
              valor={dataAlvoBR}
              aoAlterarTexto={(texto) => {
                setDataAlvoBR(mascaraDataBR(texto));
                setErros((estadoAnterior) => ({
                  ...estadoAnterior,
                  dataAlvo: undefined,
                  geral: undefined,
                }));
              }}
              placeholder="25/12/2026"
              teclado="numeric"
              erro={erros.dataAlvo}
            />
          )}

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
            placeholder="Ex: usar óleo Motul"
            multiline
          />

          <View className="flex-row items-center justify-between rounded-2xl border border-slate-700 bg-slate-900 px-4 py-4">
            <View className="pr-4">
              <Text className="text-base font-bold text-white">
                Alerta ativo
              </Text>
              <Text className="mt-1 text-sm text-slate-400">
                Você pode desativar e manter no histórico depois
              </Text>
            </View>

            <Switch
              value={ativo}
              onValueChange={setAtivo}
              trackColor={{ false: "#334155", true: "#06b6d4" }}
              thumbColor="#ffffff"
            />
          </View>

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
              {salvando ? "Salvando..." : "Salvar alerta"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
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

type BotaoTipoProps = {
  titulo: string;
  selecionado: boolean;
  onPress: () => void;
};

function BotaoTipo({ titulo, selecionado, onPress }: BotaoTipoProps) {
  return (
    <TouchableOpacity
      className={`flex-1 rounded-2xl border px-4 py-3 ${
        selecionado
          ? "border-cyan-500 bg-cyan-500/10"
          : "border-slate-700 bg-slate-900"
      }`}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text
        className={`text-center font-semibold ${
          selecionado ? "text-cyan-400" : "text-white"
        }`}
      >
        {titulo}
      </Text>
    </TouchableOpacity>
  );
}

type SeletorPeriodoProps = {
  valor: PeriodoUso;
  aoSelecionar: (valor: PeriodoUso) => void;
};

function SeletorPeriodo({ valor, aoSelecionar }: SeletorPeriodoProps) {
  return (
    <View className="flex-row overflow-hidden rounded-2xl border border-slate-700">
      {(["dia", "semana", "mes"] as PeriodoUso[]).map((periodo) => {
        const selecionado = valor === periodo;

        return (
          <TouchableOpacity
            key={periodo}
            className={`flex-1 px-3 py-3 ${
              selecionado ? "bg-cyan-500" : "bg-slate-900"
            }`}
            onPress={() => aoSelecionar(periodo)}
            activeOpacity={0.8}
          >
            <Text
              className={`text-center text-sm font-bold ${
                selecionado ? "text-slate-950" : "text-white"
              }`}
            >
              {periodo === "mes"
                ? "Mês"
                : periodo.charAt(0).toUpperCase() + periodo.slice(1)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}