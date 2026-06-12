import { useMemoriesQuery } from "./useMemoriesQuery";

export function useMemories() {
  const { data: memories = [], isLoading } = useMemoriesQuery();
  return { memories, isLoading };
}
