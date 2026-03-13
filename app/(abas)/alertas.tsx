import { SafeAreaView, Text, View } from "react-native";

export default function TelaAlertas() {
  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-3xl font-bold text-white">Alertas</Text>
        <Text className="mt-3 text-center text-base text-slate-300">
          Aqui ficarão os alertas de manutenção e as previsões de troca.
        </Text>
      </View>
    </SafeAreaView>
  );
}