import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  atualizarMoto,
  obterMotoPorId,
} from "../../src/servicos/motos-firebase";
import AlertaApp from "../../src/componentes/AlertaApp";

type ParametrosRota = {
  id?: string;
};

type ErrosFormulario = {
  marca?: string;
  modelo?: string;
  ano?: string;
  cor?: string;
  quilometragem?: string;
  fotoUri?: string;
};

export default function TelaEditarMoto() {
  const { id } = useLocalSearchParams<ParametrosRota>();

  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [ano, setAno] = useState("");
  const [cor, setCor] = useState("");
  const [quilometragem, setQuilometragem] = useState("");
  const [placa, setPlaca] = useState("");
  const [fotoUri, setFotoUri] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erros, setErros] = useState<ErrosFormulario>({});
  const [alertaPermissaoAberto, setAlertaPermissaoAberto] = useState(false);
  const [alertaSucessoAberto, setAlertaSucessoAberto] = useState(false);
  const [alertaErroAberto, setAlertaErroAberto] = useState(false);

  useEffect(() => {
    async function carregar(): Promise<void> {
      if (!id) {
        setCarregando(false);
        return;
      }

      try {
        const moto = await obterMotoPorId(id);

        if (!moto) {
          return;
        }

        setMarca(moto.marca);
        setModelo(moto.modelo);
        setAno(String(moto.ano));
        setCor(moto.cor);
        setQuilometragem(String(moto.quilometragem));
        setPlaca(moto.placa ?? "");
        setFotoUri(moto.fotoUri);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, [id]);

  function validarFormulario(): ErrosFormulario {
    const novosErros: ErrosFormulario = {};

    if (!marca.trim()) novosErros.marca = "Informe a marca.";
    if (!modelo.trim()) novosErros.modelo = "Informe o modelo.";

    if (!ano.trim()) {
      novosErros.ano = "Informe o ano.";
    } else if (Number.isNaN(Number(ano))) {
      novosErros.ano = "O ano precisa ser numérico.";
    }

    if (!cor.trim()) {
      novosErros.cor = "Informe a cor.";
    }

    if (!quilometragem.trim()) {
      novosErros.quilometragem = "Informe a quilometragem.";
    } else if (Number.isNaN(Number(quilometragem))) {
      novosErros.quilometragem = "A quilometragem precisa ser numérica.";
    }

    if (!fotoUri.trim()) {
      novosErros.fotoUri = "Selecione uma foto da moto.";
    }

    return novosErros;
  }

  async function selecionarFoto(): Promise<void> {
    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissao.granted) {
      setAlertaPermissaoAberto(true);
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!resultado.canceled) {
      setFotoUri(resultado.assets[0].uri);
      setErros((estadoAnterior) => ({
        ...estadoAnterior,
        fotoUri: undefined,
      }));
    }
  }

  function voltar(): void {
    router.replace("/(abas)/moto");
  }

  async function salvar(): Promise<void> {
    const errosValidados = validarFormulario();
    setErros(errosValidados);

    if (Object.keys(errosValidados).length > 0 || !id) {
      return;
    }

    setSalvando(true);

    try {
      await atualizarMoto(id, {
        marca: marca.trim(),
        modelo: modelo.trim(),
        ano: Number(ano),
        cor: cor.trim(),
        quilometragem: Number(quilometragem),
        fotoUri: fotoUri.trim(),
        placa: placa.trim() ? placa.trim().toUpperCase() : "",
      });

      setAlertaSucessoAberto(true);
    } catch (erro) {
      console.error("Erro ao atualizar moto:", erro);
      setAlertaErroAberto(true);
    } finally {
      setSalvando(false);
    }
  }

  function fecharAlertaSucesso(): void {
    setAlertaSucessoAberto(false);
    router.replace("/(abas)/moto");
  }

  if (carregando) {
    return (
      <>
        <SafeAreaView className="flex-1 items-center justify-center bg-slate-950">
          <Text className="text-base text-slate-300">Carregando moto...</Text>
        </SafeAreaView>

        <AlertaApp
          visivel={alertaPermissaoAberto}
          titulo="Permissão necessária"
          mensagem="Permita o acesso à galeria."
          variante="aviso"
          textoConfirmar="Fechar"
          aoFechar={() => setAlertaPermissaoAberto(false)}
          aoConfirmar={() => setAlertaPermissaoAberto(false)}
        />

        <AlertaApp
          visivel={alertaSucessoAberto}
          titulo="Sucesso"
          mensagem="Moto atualizada com sucesso."
          variante="sucesso"
          textoConfirmar="Fechar"
          aoFechar={fecharAlertaSucesso}
          aoConfirmar={fecharAlertaSucesso}
        />

        <AlertaApp
          visivel={alertaErroAberto}
          titulo="Erro"
          mensagem="Não foi possível atualizar a moto."
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
                Editar moto
              </Text>
              <Text className="mt-1 text-center text-base text-slate-300">
                Atualize os dados da moto
              </Text>
            </View>

            <View className="h-10 w-10" />
          </View>

          <View className="gap-3">
            <CampoTexto
              titulo="Marca"
              valor={marca}
              aoAlterarTexto={setMarca}
              placeholder="Yamaha"
              erro={erros.marca}
            />

            <CampoTexto
              titulo="Modelo"
              valor={modelo}
              aoAlterarTexto={setModelo}
              placeholder="Fazer 250"
              erro={erros.modelo}
            />

            <CampoTexto
              titulo="Ano"
              valor={ano}
              aoAlterarTexto={setAno}
              placeholder="2026"
              teclado="numeric"
              erro={erros.ano}
            />

            <CampoTexto
              titulo="Cor"
              valor={cor}
              aoAlterarTexto={setCor}
              placeholder="Vermelho"
              erro={erros.cor}
            />

            <CampoTexto
              titulo="Quilometragem"
              valor={quilometragem}
              aoAlterarTexto={setQuilometragem}
              placeholder="120000"
              teclado="numeric"
              erro={erros.quilometragem}
            />

            <CampoTexto
              titulo="Placa (opcional)"
              valor={placa}
              aoAlterarTexto={setPlaca}
              placeholder="ABC1D23"
              autoCapitalize="characters"
            />

            <View>
              <Text className="mb-2 text-sm font-medium text-slate-200">
                Foto
              </Text>

              <TouchableOpacity
                className="items-center rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3"
                onPress={selecionarFoto}
                activeOpacity={0.8}
              >
                <Text className="text-base font-semibold text-cyan-400">
                  Selecionar foto da moto
                </Text>
              </TouchableOpacity>

              {fotoUri ? (
                <Image
                  source={{ uri: fotoUri }}
                  className="mt-3 h-44 w-full rounded-2xl"
                  resizeMode="cover"
                />
              ) : null}

              {erros.fotoUri ? (
                <Text className="mt-2 text-sm text-red-400">{erros.fotoUri}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              className="mt-2 items-center rounded-2xl bg-cyan-500 px-4 py-3"
              onPress={salvar}
              activeOpacity={0.8}
              disabled={salvando}
            >
              <Text className="text-base font-bold text-slate-950">
                {salvando ? "Salvando..." : "Salvar alterações"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      <AlertaApp
        visivel={alertaPermissaoAberto}
        titulo="Permissão necessária"
        mensagem="Permita o acesso à galeria."
        variante="aviso"
        textoConfirmar="Fechar"
        aoFechar={() => setAlertaPermissaoAberto(false)}
        aoConfirmar={() => setAlertaPermissaoAberto(false)}
      />

      <AlertaApp
        visivel={alertaSucessoAberto}
        titulo="Sucesso"
        mensagem="Moto atualizada com sucesso."
        variante="sucesso"
        textoConfirmar="Fechar"
        aoFechar={fecharAlertaSucesso}
        aoConfirmar={fecharAlertaSucesso}
      />

      <AlertaApp
        visivel={alertaErroAberto}
        titulo="Erro"
        mensagem="Não foi possível atualizar a moto."
        variante="erro"
        textoConfirmar="Fechar"
        aoFechar={() => setAlertaErroAberto(false)}
        aoConfirmar={() => setAlertaErroAberto(false)}
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
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
};

function CampoTexto({
  titulo,
  valor,
  aoAlterarTexto,
  placeholder,
  erro,
  teclado = "default",
  autoCapitalize = "sentences",
}: CampoTextoProps) {
  return (
    <View>
      <Text className="mb-2 text-sm font-medium text-slate-200">{titulo}</Text>

      <TextInput
        className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-base text-white"
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        value={valor}
        onChangeText={aoAlterarTexto}
        keyboardType={teclado}
        autoCapitalize={autoCapitalize}
      />

      {erro ? <Text className="mt-2 text-sm text-red-400">{erro}</Text> : null}
    </View>
  );
}