import { useMemo, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useMemoriesQuery } from "@/hooks/useMemoriesQuery";
import { MOOD_EMOJI, type Memory, type MoodTag } from "@/store/memories";
import { toDateKey } from "@/lib/dates";
import { CalendarHeader } from "@/components/journal/CalendarHeader";
import { MonthCalendar } from "@/components/journal/MonthCalendar";
import { useTheme } from "@/hooks/useTheme";
import type { Theme } from "@/lib/theme";

export default function JournalScreen() {
  const t = useTheme();
  const { data: memories = [] } = useMemoriesQuery();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-based

  const markedDates = useMemo(() => {
    const set = new Set<string>();
    for (const m of memories) set.add(toDateKey(new Date(m.created_at)));
    return set;
  }, [memories]);

  const stats = useMemo(() => computeStats(memories, markedDates), [memories, markedDates]);

  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  function goPrev() {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
  }

  function goNext() {
    if (isCurrentMonth) return;
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
  }

  const s = createStyles(t);

  return (
    <SafeAreaView style={[s.flex, { backgroundColor: t.background }]} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.nav}>
          <Text style={[s.navTitle, { color: t.text }]}>Journal</Text>
        </View>

        {/* Stats strip */}
        <View style={[s.stats, { backgroundColor: t.surface, borderColor: t.border }]}>
          <View style={s.statCell}>
            <Text style={[s.statNum, { color: t.text }]}>
              {stats.streak > 0 ? `${stats.streak}🔥` : "0"}
            </Text>
            <Text style={[s.statLabel, { color: t.textMuted }]}>Day streak</Text>
          </View>
          <View style={[s.statDivider, { backgroundColor: t.border }]} />
          <View style={s.statCell}>
            <Text style={[s.statNum, { color: t.text }]}>{memories.length}</Text>
            <Text style={[s.statLabel, { color: t.textMuted }]}>Memories</Text>
          </View>
          <View style={[s.statDivider, { backgroundColor: t.border }]} />
          <View style={s.statCell}>
            <Text style={s.statNum}>{stats.favoriteMood ?? "—"}</Text>
            <Text style={[s.statLabel, { color: t.textMuted }]}>Top mood</Text>
          </View>
        </View>

        {/* Calendar */}
        <View style={[s.calendarCard, { backgroundColor: t.surface, borderColor: t.border }]}>
          <CalendarHeader
            year={year}
            month={month}
            onPrev={goPrev}
            onNext={goNext}
            nextDisabled={isCurrentMonth}
          />
          <View style={s.calendarBody}>
            <MonthCalendar
              year={year}
              month={month}
              markedDates={markedDates}
              onSelectDay={(key) => router.push(`/(app)/journal/${key}`)}
            />
          </View>
        </View>

        <View style={s.hintRow}>
          <Ionicons name="information-circle-outline" size={14} color={t.textFaint} />
          <Text style={[s.hint, { color: t.textFaint }]}>
            Tap a day to see your memories from that day
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function computeStats(memories: Memory[], markedDates: Set<string>) {
  // Streak: chuỗi ngày liên tiếp có memory, tính lùi từ hôm nay
  // (hôm nay chưa post thì tính từ hôm qua — chưa "đứt" streak)
  let streak = 0;
  const cursor = new Date();
  if (!markedDates.has(toDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (markedDates.has(toDateKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  const moodCounts = new Map<MoodTag, number>();
  for (const m of memories) {
    if (m.mood_tag) moodCounts.set(m.mood_tag, (moodCounts.get(m.mood_tag) ?? 0) + 1);
  }
  let favoriteMood: string | null = null;
  let best = 0;
  for (const [tag, count] of moodCounts) {
    if (count > best) {
      best = count;
      favoriteMood = MOOD_EMOJI[tag];
    }
  }

  return { streak, favoriteMood };
}

function createStyles(t: Theme) {
  return StyleSheet.create({
    flex: { flex: 1 },
    scroll: { paddingBottom: 32 },
    nav: {
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    navTitle: { fontSize: 22, fontWeight: "800" },
    stats: {
      flexDirection: "row",
      alignItems: "center",
      marginHorizontal: 16,
      borderRadius: 16,
      borderWidth: 1,
      paddingVertical: 14,
    },
    statCell: { flex: 1, alignItems: "center", gap: 2 },
    statNum: { fontSize: 18, fontWeight: "800" },
    statLabel: { fontSize: 11.5, fontWeight: "600" },
    statDivider: { width: 1, height: 28 },
    calendarCard: {
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 20,
      borderWidth: 1,
      padding: 16,
    },
    calendarBody: { marginTop: 12 },
    hintRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 5,
      marginTop: 14,
    },
    hint: { fontSize: 12 },
  });
}
