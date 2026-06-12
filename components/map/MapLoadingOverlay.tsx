import { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";

const GHOST_POSITIONS = [
  { top: "28%", left: "18%" },
  { top: "44%", left: "58%" },
  { top: "22%", right: "22%" },
  { top: "62%", left: "38%" },
] as const;

interface Props {
  visible: boolean;
}

export function MapLoadingOverlay({ visible }: Props) {
  const t = useTheme();
  const opacity = useRef(new Animated.Value(0.25)).current;
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (!visible) {
      animRef.current?.stop();
      opacity.setValue(0);
      return;
    }
    animRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.25,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    animRef.current.start();
    return () => animRef.current?.stop();
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {GHOST_POSITIONS.map((pos, i) => (
        <Animated.View
          key={i}
          style={[
            styles.ghostPin,
            pos,
            {
              backgroundColor: t.primaryLight,
              borderColor: t.primary,
              opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  ghostPin: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 14,
    borderWidth: 2.5,
  },
});
