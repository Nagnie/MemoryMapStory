import { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { toDateKey } from "@/lib/dates";
import { useTheme } from "@/hooks/useTheme";

interface Props {
  year: number;
  month: number; // 0-based
  /** Set các dateKey ("YYYY-MM-DD") có memory */
  markedDates: Set<string>;
  onSelectDay: (dateKey: string) => void;
}

// Tuần bắt đầu thứ 2 (chuẩn VN)
const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export function MonthCalendar({ year, month, markedDates, onSelectDay }: Props) {
  const t = useTheme();
  const todayKey = toDateKey(new Date());

  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // getDay(): 0 = CN → offset Mon-first
    const offset = (firstDay.getDay() + 6) % 7;
    const result: (number | null)[] = Array(offset).fill(null);
    for (let d = 1; d <= daysInMonth; d++) result.push(d);
    while (result.length % 7 !== 0) result.push(null);
    return result;
  }, [year, month]);

  return (
    <View>
      <View style={styles.weekRow}>
        {WEEKDAY_LABELS.map((label, i) => (
          <Text key={i} style={[styles.weekday, { color: t.textFaint }]}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((day, i) => {
          if (day === null) {
            return <View key={i} style={styles.cell} />;
          }
          const key = toDateKey(new Date(year, month, day));
          const isToday = key === todayKey;
          const hasMemory = markedDates.has(key);
          const isFuture = key > todayKey;

          return (
            <TouchableOpacity
              key={i}
              style={styles.cell}
              onPress={() => onSelectDay(key)}
              disabled={isFuture}
              activeOpacity={0.6}
            >
              <View
                style={[
                  styles.dayCircle,
                  isToday && { backgroundColor: `${t.primary}22`, borderWidth: 1.5, borderColor: t.primary },
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    {
                      color: isFuture
                        ? t.textFaint
                        : isToday || hasMemory
                          ? t.text
                          : t.textSecondary,
                      fontWeight: isToday || hasMemory ? "700" : "400",
                    },
                  ]}
                >
                  {day}
                </Text>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: hasMemory ? t.primary : "transparent" },
                  ]}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  weekRow: {
    flexDirection: "row",
    marginBottom: 6,
  },
  weekday: {
    flex: 1,
    textAlign: "center",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 0.95,
    alignItems: "center",
    justifyContent: "center",
  },
  dayCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: { fontSize: 14.5 },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 2,
  },
});
