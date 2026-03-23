import { Tabs, router } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTema } from "../../src/contextos/tema-contexto";

export default function LayoutAbas() {
  const insets = useSafeAreaInsets();
  const { cores } = useTema();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: cores.primaria,
        tabBarInactiveTintColor: cores.textoSuave,

        tabBarStyle: {
          backgroundColor: cores.fundo,
          borderTopColor: cores.borda,
          height: 80 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom + 12,

          // 🔥 NOVO (corrige deslocamento)
          paddingHorizontal: 0,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },

        // 🔥 CORREÇÃO PRINCIPAL
        tabBarItemStyle: {
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      <Tabs.Screen
        name="moto"
        options={{
          title: "Moto",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="motorbike" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="manutencoes"
        options={{
          title: "Manutenções",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="wrench" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="alertas"
        options={{
          title: "Alertas",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="configuracoes"
        options={{
          title: "Configurações",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
        listeners={{
          tabPress: () => {
            router.replace("/configuracoes");
          },
        }}
      />
    </Tabs>
  );
}