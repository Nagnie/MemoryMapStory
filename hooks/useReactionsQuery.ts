import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";
import type { ReactionGroup } from "@/components/memory/ReactionPicker";

export const reactionsQueryKey = (memoryId: string | undefined) =>
  ["reactions", memoryId] as const;

export function useReactionsQuery(memoryId: string | undefined) {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: reactionsQueryKey(memoryId),
    queryFn: async () => {
      const { data } = await supabase
        .from("reactions")
        .select("emoji, user_id")
        .eq("memory_id", memoryId!);

      if (!data) return [] as ReactionGroup[];

      const grouped: Record<string, { count: number; mine: boolean }> = {};
      for (const r of data) {
        if (!grouped[r.emoji]) grouped[r.emoji] = { count: 0, mine: false };
        grouped[r.emoji].count++;
        if (r.user_id === user?.id) grouped[r.emoji].mine = true;
      }

      return Object.entries(grouped).map(([emoji, { count, mine }]) => ({
        emoji,
        count,
        mine,
      })) as ReactionGroup[];
    },
    enabled: !!memoryId && !!user,
  });
}

export function useToggleReactionMutation(memoryId: string | undefined) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async (emoji: string) => {
      if (!user || !memoryId) throw new Error("Not authenticated");

      const current = queryClient.getQueryData<ReactionGroup[]>(
        reactionsQueryKey(memoryId)
      );
      const alreadyMine = current?.find((r) => r.emoji === emoji && r.mine);

      if (alreadyMine) {
        const { error } = await supabase
          .from("reactions")
          .delete()
          .eq("memory_id", memoryId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("reactions")
          .upsert(
            { memory_id: memoryId, user_id: user.id, emoji },
            { onConflict: "memory_id,user_id" }
          );
        if (error) throw error;
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: reactionsQueryKey(memoryId) });
    },
  });
}
