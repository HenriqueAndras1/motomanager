import { Stack } from "expo-router";

export default function LayoutConfiguracoes() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    />
  );
}