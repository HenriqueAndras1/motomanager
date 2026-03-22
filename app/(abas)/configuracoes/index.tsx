import { SafeAreaView, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useTema } from "../../../src/contextos/tema-contexto";

export default function Configuracoes() {
  const { cores } = useTema();

  const Item = ({ icone, titulo, rota }: any) => (
    <TouchableOpacity
      onPress={() => router.push(rota)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: cores.borda,
      }}
      activeOpacity={0.7}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Ionicons name={icone} size={20} color={cores.texto} />
        <Text style={{ color: cores.texto, fontSize: 16 }}>
          {titulo}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={cores.textoSuave} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: cores.fundo }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 56, paddingBottom: 24 }}>
        
        {/* 🔥 HEADER PADRÃO IGUAL ALERTAS */}
        <View style={{ marginBottom: 24, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          
          <View style={{ width: 32, height: 32 }} />

          <View style={{ flex: 1, paddingHorizontal: 16 }}>
            <Text
              style={{
                fontSize: 28, // 🔥 igual Alertas (text-3xl)
                fontWeight: "bold",
                color: cores.texto,
                textAlign: "center",
              }}
            >
              Configurações
            </Text>

            <Text
              style={{
                marginTop: 4,
                fontSize: 16,
                color: cores.textoSecundario,
                textAlign: "center",
              }}
            >
              Ajustes do Aplicativo
            </Text>
          </View>

          <View style={{ width: 32, height: 32 }} />
        </View>

        {/* 🔥 CARD MANTENDO SUA ESTRUTURA */}
        <View
          style={{
            borderRadius: 16, // leve ajuste visual (igual rounded-2xl)
            overflow: "hidden",
            borderWidth: 1,
            borderColor: cores.borda,
            backgroundColor: cores.fundoCard,
          }}
        >
          <Item icone="color-palette" titulo="Aparência" rota="/configuracoes/aparencia" />
          <Item icone="notifications" titulo="Notificações" rota="/configuracoes/notificacoes" />
          <Item icone="information-circle" titulo="Sobre o app" rota="/configuracoes/sobre" />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}