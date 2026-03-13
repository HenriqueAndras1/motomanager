import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, SafeAreaView, ScrollView, Text, View } from "react-native";
import { obterMotoPorId } from "../../src/servicos/motos-firebase";
import { Moto } from "../../src/tipos/moto";

type ParametrosRota = {
  id?: string;
};

export default function TelaDetalhesMoto() {
  const { id } = useLocalSearchParams<ParametrosRota>();
  const [moto, setMoto] = useState<Moto | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarMoto(): Promise<void> {
      if (!id) {
        setCarregando(false);
        return;
      }

      const motoEncontrada = await obterMotoPorId(id);
      setMoto(motoEncontrada);
      setCarregando(false);
    }

    carregarMoto();
  }, [id]);

  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <ScrollView contentContainerClassName="px-5 py-8">
        {carregando ? (
          <Text className="text-base text-slate-300">Carregando moto...</Text>
        ) : null}

        {!carregando && !moto ? (
          <Text className="text-base text-red-400">Moto não encontrada.</Text>
        ) : null}

        {moto ? (
          <View>
            <Image
              source={{ uri: moto.fotoUri }}
              className="h-64 w-full rounded-3xl"
              resizeMode="cover"
            />

            <Text className="mt-5 text-3xl font-bold text-white">
              {moto.marca} {moto.modelo}
            </Text>

            <View className="mt-6 gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <LinhaDetalhe titulo="ID" valor={moto.id} />
              <LinhaDetalhe titulo="Marca" valor={moto.marca} />
              <LinhaDetalhe titulo="Modelo" valor={moto.modelo} />
              <LinhaDetalhe titulo="Ano" valor={String(moto.ano)} />
              <LinhaDetalhe titulo="Cor" valor={moto.cor} />
              <LinhaDetalhe
                titulo="Quilometragem"
                valor={`${moto.quilometragem.toLocaleString("pt-BR")} km`}
              />
              <LinhaDetalhe
                titulo="Placa"
                valor={moto.placa ? moto.placa : "Não informada"}
              />
            </View>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

type LinhaDetalheProps = {
  titulo: string;
  valor: string;
};

function LinhaDetalhe({ titulo, valor }: LinhaDetalheProps) {
  return (
    <View className="border-b border-slate-800 pb-3">
      <Text className="text-sm font-medium text-slate-400">{titulo}</Text>
      <Text className="mt-1 text-base text-white">{valor}</Text>
    </View>
  );
}
