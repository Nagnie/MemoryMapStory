import { useEffect } from "react";
import { Stack, router } from "expo-router";
import { useAuthStore } from "@/store/auth";

export default function AppLayout() {
  const { session } = useAuthStore();

  useEffect(() => {
    if (!session) {
      router.replace("/(auth)/login");
    }
  }, [session]);

  if (!session) return null;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    />
  );
}
