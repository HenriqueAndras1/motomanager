import "../global.css";
import { Stack } from "expo-router";
import { MD3DarkTheme, MD3LightTheme, Provider as PaperProvider } from "react-native-paper";
import { TemaProvider, useTema } from "../src/contextos/tema-contexto";

function AppComTema() {
  const { tema } = useTema();

  const temaPaper =
    tema === "claro"
      ? {
          ...MD3LightTheme,
          colors: {
            ...MD3LightTheme.colors,
            primary: "#06b6d4",
            background: "#f8fafc",
            surface: "#ffffff",
            surfaceVariant: "#e2e8f0",
            onSurface: "#0f172a",
            outline: "#cbd5e1",
            error: "#ef4444",
          },
        }
      : {
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

  return (
    <PaperProvider theme={temaPaper}>
      <Stack screenOptions={{ headerShown: false }} />
    </PaperProvider>
  );
}

export default function LayoutRaiz() {
  return (
    <TemaProvider>
      <AppComTema />
    </TemaProvider>
  );
}