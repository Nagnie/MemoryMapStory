import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, View } from "react-native";
import { useTheme } from "@/hooks/useTheme";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "outline" | "ghost";
  isLoading?: boolean;
  disabled?: boolean;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  isLoading = false,
  disabled = false,
}: ButtonProps) {
  const t = useTheme();

  const containerStyle = [
    styles.base,
    variant === "primary" && { backgroundColor: t.primary },
    variant === "outline" && { borderWidth: 2, borderColor: t.primary, backgroundColor: "transparent" },
    variant === "ghost" && { backgroundColor: "transparent" },
    (disabled || isLoading) && styles.disabled,
  ];

  const textColor = variant === "primary" ? "#ffffff" : t.primary;

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
    >
      {isLoading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator color={textColor} size="small" />
        </View>
      ) : null}
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  disabled: { opacity: 0.6 },
  loadingWrapper: { marginRight: 4 },
  label: { fontSize: 16, fontWeight: "600" },
});
