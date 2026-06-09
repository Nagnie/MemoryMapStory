import { useColorScheme } from "react-native";
import { colors, Theme } from "@/lib/theme";

export function useTheme(): Theme {
  const scheme = useColorScheme();
  return colors[scheme === "dark" ? "dark" : "light"];
}
