import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { useAuth } from "@/hooks/useAuth";

export default function RootLayout() {
  const { isLoading } = useAuth();
  const scheme = useColorScheme();

  if (isLoading) return null;

  return (
    <>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
