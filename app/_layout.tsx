import "../global.css";
import { Stack } from "expo-router";
import { MD3DarkTheme, Provider as PaperProvider } from "react-native-paper";

const tema = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#06b6d4",
    background: "#020617",
    surface: "#0f172a",
    surfaceVariant: "#1e293b",
    onSurface: "#ffffff",
    outline: "#334155",
    error: "#ef4444",
  },
};

export default function LayoutRaiz() {
  return (
    <PaperProvider theme={tema}>
      <Stack screenOptions={{ headerShown: false }} />
    </PaperProvider>
  );
}