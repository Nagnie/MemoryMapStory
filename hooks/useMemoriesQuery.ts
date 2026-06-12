import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";
import type { Memory } from "@/store/memories";

export const memoriesQueryKey = (userId: string | undefined) =>
  ["memories", userId] as const;

export function useMemoriesQuery() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: memoriesQueryKey(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Memory[];
    },
    enabled: !!user,
  });
}

export function useDeleteMemoryMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("memories").delete().eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      queryClient.setQueryData<Memory[]>(
        memoriesQueryKey(user?.id),
        (old) => old?.filter((m) => m.id !== id) ?? []
      );
      // Xóa memory khỏi duo cache nếu có
      queryClient.invalidateQueries({ queryKey: ["duoMemories"] });
    },
  });
}
