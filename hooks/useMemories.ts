import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";
import { useMemoriesStore, Memory } from "@/store/memories";

export function useMemories() {
  const { user } = useAuthStore();
  const { memories, isLoading, setMemories, addMemory, setLoading } = useMemoriesStore();

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    supabase
      .from("memories")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setMemories(data as Memory[]);
        setLoading(false);
      });
  }, [user?.id]);

  return { memories, isLoading, addMemory };
}
