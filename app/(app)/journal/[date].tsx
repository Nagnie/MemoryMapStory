import { useMemo } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMemoriesQuery } from "@/hooks/useMemoriesQuery";
import { toDateKey, fromDateKey } from "@/lib/dates";
import { MemoryCard } from "@/components/journal/MemoryCard";
import { useTheme } from "@/hooks/useTheme";

export default function JournalDayScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const t = useTheme();
  const { data: memories = [] } = useMemoriesQuery();

  const dayMemories = useMemo(
    () =>
      memories
        .filter((m) => toDateKey(new Date(m.created_at)) === date)
        .sort((a, b) => a.created_at.localeCompare(b.created_at)),
    [memories, date]
  );

  const title = date
    ? fromDateKey(date).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: t.background }]} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={t.text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: t.text }]} numberOfLines={1}>
            {title}
          </Text>
          <Text style={[styles.subtitle, { color: t.textMuted }]}>
            {dayMemories.length} {dayMemories.length === 1 ? "memory" : "memories"}
          </Text>
        </View>
      </View>

      <FlatList
        data={dayMemories}
        keyExtractor={(m) => m.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <MemoryCard
            memory={item}
            onPress={() => router.push(`/(app)/memory/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="moon-outline" size={44} color={t.textFaint} />
            <Text style={[styles.emptyTitle, { color: t.textSecondary }]}>
              No memories this day
            </Text>
            <Text style={[styles.emptyHint, { color: t.textFaint }]}>
              Quiet days are part of the story too
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: { flex: 1 },
  title: { fontSize: 17, fontWeight: "700" },
  subtitle: { fontSize: 12.5, marginTop: 1 },
  list: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 32, flexGrow: 1 },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingBottom: 60,
  },
  emptyTitle: { fontSize: 15.5, fontWeight: "700", marginTop: 4 },
  emptyHint: { fontSize: 13 },
});
