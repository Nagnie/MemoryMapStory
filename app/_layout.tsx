import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "react-native";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
// Side-effect import: đăng ký background location task ở global scope trước khi screen mount.
import "@/lib/locationTask";

export default function RootLayout() {
  const { isLoading } = useAuth();
  const scheme = useColorScheme();

  if (isLoading) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style={scheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}
