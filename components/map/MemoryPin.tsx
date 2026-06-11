import { View, Image, StyleSheet } from "react-native";

interface Props {
  imageUrl: string;
  size?: number;
  borderColor?: string;
}

export function MemoryPin({ imageUrl, size = 54, borderColor = "#fff" }: Props) {
  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.frame,
          {
            width: size,
            height: size,
            borderRadius: size * 0.28,
            borderColor,
          },
        ]}
      >
        <View style={[styles.placeholder, { borderRadius: size * 0.22 }]} />
        <Image
          source={{ uri: imageUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
        />
      </View>
      <View style={[styles.tail, { borderTopColor: borderColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
  },
  frame: {
    overflow: "hidden",
    borderWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 6,
  },
  placeholder: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "#d1d5db",
  },
  tail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 9,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    marginTop: -1,
  },
});
