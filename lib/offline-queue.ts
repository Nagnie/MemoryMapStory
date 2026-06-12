import AsyncStorage from "@react-native-async-storage/async-storage";
import type { MoodTag } from "@/store/memories";

const QUEUE_KEY = "@offline_queue";

export interface DraftMemory {
  id: string;
  imageUri: string;
  latitude: number;
  longitude: number;
  caption: string | null;
  mood_tag: MoodTag | null;
  created_at: string;
}

export const OfflineQueue = {
  async getQueue(): Promise<DraftMemory[]> {
    try {
      const raw = await AsyncStorage.getItem(QUEUE_KEY);
      return raw ? (JSON.parse(raw) as DraftMemory[]) : [];
    } catch {
      return [];
    }
  },

  async enqueue(draft: DraftMemory): Promise<void> {
    const queue = await this.getQueue();
    queue.push(draft);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  },

  async remove(id: string): Promise<void> {
    const queue = await this.getQueue();
    await AsyncStorage.setItem(
      QUEUE_KEY,
      JSON.stringify(queue.filter((d) => d.id !== id))
    );
  },

  async clear(): Promise<void> {
    await AsyncStorage.removeItem(QUEUE_KEY);
  },
};

export function generateDraftId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
