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
import { useTema } from "../../src/contextos/tema-contexto";
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
  const { cores } = useTema();
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

    void carregar();

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

    if (
      Object.keys(novosErros).length > 0 ||
      !id ||
      !motoSelecionada ||
      !alertaAtual
    ) {
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
      <SafeAreaView
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: cores.fundo }}
      >
        <Text className="text-base" style={{ color: cores.textoSecundario }}>
          Carregando alerta...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: cores.fundo }}>
      <ScrollView
        contentContainerClassName="px-5 pt-14 pb-6"
        keyboardShouldPersistTaps="handled"
      >
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
              Editar alerta
            </Text>
            <Text
              className="mt-1 text-center text-base"
              style={{ color: cores.textoSecundario }}
            >
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
            cores={cores}
          />

          <View>
            <Text
              className="mb-2 text-sm font-medium"
              style={{ color: cores.textoSecundario }}
            >
              Tipo do alerta
            </Text>

            <View className="flex-row gap-3">
              <BotaoTipo
                titulo="Manutenção por KM"
                selecionado={tipo === "manutencao_km"}
                onPress={() => setTipo("manutencao_km")}
                cores={cores}
              />
              <BotaoTipo
                titulo="Por data"
                selecionado={tipo === "data"}
                onPress={() => setTipo("data")}
                cores={cores}
              />
            </View>
          </View>

          {tipo === "manutencao_km" ? (
            <>
              <View
                className="rounded-2xl px-4 py-4"
                style={{
                  borderWidth: 1,
                  borderColor: cores.borda,
                  backgroundColor: cores.fundoCard,
                }}
              >
                <Text
                  className="text-sm font-medium"
                  style={{ color: cores.textoSuave }}
                >
                  Quilometragem atual da moto
                </Text>
                <Text
                  className="mt-1 text-base font-bold"
                  style={{ color: cores.texto }}
                >
                  {motoSelecionada
                    ? `${motoSelecionada.quilometragem.toLocaleString("pt-BR")} km`
                    : "Carregando..."}
                </Text>

                <Text
                  className="mt-3 text-sm font-medium"
                  style={{ color: cores.textoSuave }}
                >
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
                cores={cores}
              />

              {motoSelecionada && quilometragemObjetivo ? (
                <View
                  className="rounded-2xl px-4 py-4"
                  style={{
                    borderWidth: 1,
                    borderColor: cores.borda,
                    backgroundColor: cores.fundoCard,
                  }}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{ color: cores.textoSuave }}
                  >
                    Comparativo
                  </Text>
                  <Text className="mt-1 text-base" style={{ color: cores.texto }}>
                    Atual: {motoSelecionada.quilometragem.toLocaleString("pt-BR")} km
                  </Text>
                  <Text className="mt-1 text-base" style={{ color: cores.texto }}>
                    Alvo: {Number(quilometragemObjetivo).toLocaleString("pt-BR")} km
                  </Text>
                </View>
              ) : null}

              <View>
                <Text
                  className="mb-2 text-sm font-medium"
                  style={{ color: cores.textoSecundario }}
                >
                  Uso médio
                </Text>

                <View className="flex-row gap-3">
                  <View className="flex-1">
                    <TextInput
                      className="rounded-2xl px-4 py-3 text-base"
                      style={{
                        borderWidth: 1,
                        borderColor: cores.borda,
                        backgroundColor: cores.fundoCard,
                        color: cores.texto,
                      }}
                      placeholder="Ex: 100"
                      placeholderTextColor={cores.textoSuave}
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
                      cores={cores}
                    />
                  </View>
                </View>

                {erros.usoMedioValor ? (
                  <Text className="mt-2 text-sm" style={{ color: cores.perigo }}>
                    {erros.usoMedioValor}
                  </Text>
                ) : null}
              </View>

              {previewManutencao ? (
                <View
                  className="rounded-2xl px-4 py-4"
                  style={{
                    borderWidth: 1,
                    borderColor: `${cores.primaria}4D`,
                    backgroundColor: `${cores.primaria}1A`,
                  }}
                >
                  <Text
                    className="text-sm font-medium"
                    style={{ color: cores.primaria }}
                  >
                    Previsão aproximada
                  </Text>
                  <Text className="mt-1 text-base" style={{ color: cores.texto }}>
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
              cores={cores}
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
            cores={cores}
          />

          <View
            className="flex-row items-center justify-between rounded-2xl px-4 py-4"
            style={{
              borderWidth: 1,
              borderColor: cores.borda,
              backgroundColor: cores.fundoCard,
            }}
          >
            <View className="pr-4">
              <Text
                className="text-base font-bold"
                style={{ color: cores.texto }}
              >
                Alerta ativo
              </Text>
              <Text
                className="mt-1 text-sm"
                style={{ color: cores.textoSuave }}
              >
                Você pode desativar e manter no histórico depois
              </Text>
            </View>

            <Switch
              value={ativo}
              onValueChange={setAtivo}
              trackColor={{ false: cores.borda, true: cores.primaria }}
              thumbColor="#ffffff"
            />
          </View>

          {erros.geral ? (
            <Text className="text-sm" style={{ color: cores.perigo }}>
              {erros.geral}
            </Text>
          ) : null}

          <TouchableOpacity
            className="mt-2 items-center rounded-2xl px-4 py-3"
            style={{ backgroundColor: cores.primaria }}
            onPress={salvar}
            activeOpacity={0.8}
            disabled={salvando}
          >
            <Text
              className="text-base font-bold"
              style={{ color: cores.fundo }}
            >
              {salvando ? "Salvando..." : "Salvar alerta"}
            </Text>
          </TouchableOpacity>
        </View>
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

type CampoTextoProps = {
  titulo: string;
  valor: string;
  aoAlterarTexto: (texto: string) => void;
  placeholder: string;
  erro?: string;
  teclado?: "default" | "numeric";
  multiline?: boolean;
  cores: CoresTema;
};

function CampoTexto({
  titulo,
  valor,
  aoAlterarTexto,
  placeholder,
  erro,
  teclado = "default",
  multiline = false,
  cores,
}: CampoTextoProps) {
  return (
    <View>
      <Text
        className="mb-2 text-sm font-medium"
        style={{ color: cores.textoSecundario }}
      >
        {titulo}
      </Text>

      <TextInput
        className={`rounded-2xl px-4 py-3 text-base ${
          multiline ? "min-h-28" : ""
        }`}
        style={{
          borderWidth: 1,
          borderColor: cores.borda,
          backgroundColor: cores.fundoCard,
          color: cores.texto,
        }}
        placeholder={placeholder}
        placeholderTextColor={cores.textoSuave}
        value={valor}
        onChangeText={aoAlterarTexto}
        keyboardType={teclado}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "auto"}
      />

      {erro ? (
        <Text className="mt-2 text-sm" style={{ color: cores.perigo }}>
          {erro}
        </Text>
      ) : null}
    </View>
  );
}

type BotaoTipoProps = {
  titulo: string;
  selecionado: boolean;
  onPress: () => void;
  cores: CoresTema;
};

function BotaoTipo({
  titulo,
  selecionado,
  onPress,
  cores,
}: BotaoTipoProps) {
  return (
    <TouchableOpacity
      className="flex-1 rounded-2xl border px-4 py-3"
      style={{
        borderColor: selecionado ? cores.primaria : cores.borda,
        backgroundColor: selecionado ? `${cores.primaria}1A` : cores.fundoCard,
      }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text
        className="text-center font-semibold"
        style={{ color: selecionado ? cores.primaria : cores.texto }}
      >
        {titulo}
      </Text>
    </TouchableOpacity>
  );
}

type SeletorPeriodoProps = {
  valor: PeriodoUso;
  aoSelecionar: (valor: PeriodoUso) => void;
  cores: CoresTema;
};

function SeletorPeriodo({
  valor,
  aoSelecionar,
  cores,
}: SeletorPeriodoProps) {
  return (
    <View
      className="flex-row overflow-hidden rounded-2xl"
      style={{
        borderWidth: 1,
        borderColor: cores.borda,
      }}
    >
      {(["dia", "semana", "mes"] as PeriodoUso[]).map((periodo) => {
        const selecionado = valor === periodo;

        return (
          <TouchableOpacity
            key={periodo}
            className="flex-1 px-3 py-3"
            style={{
              backgroundColor: selecionado ? cores.primaria : cores.fundoCard,
            }}
            onPress={() => aoSelecionar(periodo)}
            activeOpacity={0.8}
          >
            <Text
              className="text-center text-sm font-bold"
              style={{ color: selecionado ? cores.fundo : cores.texto }}
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