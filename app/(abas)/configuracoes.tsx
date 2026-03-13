import { SafeAreaView, Text, View } from "react-native";

export default function TelaConfiguracoes() {
  return (
    <SafeAreaView className="flex-1 bg-slate-950">
      <View className="flex-1 items-center justify-center px-6">
        <Text className="text-3xl font-bold text-white">Configurações</Text>
        <Text className="mt-3 text-center text-base text-slate-300">
          Aqui ficarão as preferências e configurações do aplicativo.
        </Text>
      </View>
    </SafeAreaView>
  );
}