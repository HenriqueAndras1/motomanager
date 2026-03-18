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
import { useTema } from "../../src/contextos/tema-contexto";

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
  const { cores } = useTema();
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

    void carregar();
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
      console.error("Erro ao atualizar a moto:", erro);
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
        <SafeAreaView
          className="flex-1 items-center justify-center"
          style={{ backgroundColor: cores.fundo }}
        >
          <Text className="text-base" style={{ color: cores.textoSecundario }}>
            Carregando moto...
          </Text>
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
                Editar moto
              </Text>
              <Text
                className="mt-1 text-center text-base"
                style={{ color: cores.textoSecundario }}
              >
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
              cores={cores}
            />

            <CampoTexto
              titulo="Modelo"
              valor={modelo}
              aoAlterarTexto={setModelo}
              placeholder="Fazer 250"
              erro={erros.modelo}
              cores={cores}
            />

            <CampoTexto
              titulo="Ano"
              valor={ano}
              aoAlterarTexto={setAno}
              placeholder="2026"
              teclado="numeric"
              erro={erros.ano}
              cores={cores}
            />

            <CampoTexto
              titulo="Cor"
              valor={cor}
              aoAlterarTexto={setCor}
              placeholder="Vermelho"
              erro={erros.cor}
              cores={cores}
            />

            <CampoTexto
              titulo="Quilometragem"
              valor={quilometragem}
              aoAlterarTexto={setQuilometragem}
              placeholder="120000"
              teclado="numeric"
              erro={erros.quilometragem}
              cores={cores}
            />

            <CampoTexto
              titulo="Placa (opcional)"
              valor={placa}
              aoAlterarTexto={setPlaca}
              placeholder="ABC1D23"
              autoCapitalize="characters"
              cores={cores}
            />

            <View>
              <Text
                className="mb-2 text-sm font-medium"
                style={{ color: cores.textoSecundario }}
              >
                Foto
              </Text>

              <TouchableOpacity
                className="items-center rounded-2xl px-4 py-3"
                style={{
                  borderWidth: 1,
                  borderColor: cores.borda,
                  backgroundColor: cores.fundoCard,
                }}
                onPress={selecionarFoto}
                activeOpacity={0.8}
              >
                <Text
                  className="text-base font-semibold"
                  style={{ color: cores.primaria }}
                >
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
                <Text className="mt-2 text-sm" style={{ color: cores.perigo }}>
                  {erros.fotoUri}
                </Text>
              ) : null}
            </View>

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
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  cores: CoresTema;
};

function CampoTexto({
  titulo,
  valor,
  aoAlterarTexto,
  placeholder,
  erro,
  teclado = "default",
  autoCapitalize = "sentences",
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
        className="rounded-2xl px-4 py-3 text-base"
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
        autoCapitalize={autoCapitalize}
      />

      {erro ? (
        <Text className="mt-2 text-sm" style={{ color: cores.perigo }}>
          {erro}
        </Text>
      ) : null}
    </View>
  );
}