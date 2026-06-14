import {
  Modal,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MOOD_EMOJI, type Memory } from "@/store/memories";
import { useTheme } from "@/hooks/useTheme";

interface Props {
  memories: Memory[] | null;
  onClose: () => void;
  onSelect: (id: string) => void;
}

// Bảng chọn hiện toàn bộ ảnh ở cùng một vị trí khi bấm vào chồng thẻ.
export function StackSheet({ memories, onClose, onSelect }: Props) {
  const t = useTheme();
  const visible = !!memories && memories.length > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { backgroundColor: t.surface }]}
          onPress={() => {}}
        >
          <SafeAreaView edges={["bottom"]}>
            <View style={styles.handle} />
            <Text style={[styles.title, { color: t.text }]}>
              {memories?.length} kỷ niệm ở đây
            </Text>

            <FlatList
              data={memories ?? []}
              keyExtractor={(m) => m.id}
              numColumns={3}
              columnWrapperStyle={styles.row}
              contentContainerStyle={styles.grid}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cell}
                  activeOpacity={0.8}
                  onPress={() => onSelect(item.id)}
                >
                  <Image source={{ uri: item.image_url }} style={styles.thumb} />
                  {item.mood_tag ? (
                    <Text style={styles.mood}>{MOOD_EMOJI[item.mood_tag]}</Text>
                  ) : null}
                  {item.place_name ? (
                    <Text
                      style={[styles.place, { color: t.textMuted }]}
                      numberOfLines={1}
                    >
                      {item.place_name}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              )}
            />
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    maxHeight: "70%",
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#9ca3af",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  grid: {
    paddingBottom: 8,
  },
  row: {
    gap: 8,
    marginBottom: 8,
  },
  cell: {
    flex: 1 / 3,
  },
  thumb: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: "#d1d5db",
  },
  mood: {
    position: "absolute",
    top: 4,
    right: 6,
    fontSize: 16,
  },
  place: {
    fontSize: 11,
    marginTop: 3,
  },
});
