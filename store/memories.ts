export type MoodTag = "happy" | "nostalgic" | "excited" | "peaceful" | "sad";

export const MOOD_EMOJI: Record<MoodTag, string> = {
  happy: "😊",
  nostalgic: "🥺",
  excited: "🤩",
  peaceful: "😌",
  sad: "😢",
};

export interface Memory {
  id: string;
  user_id: string;
  image_url: string;
  latitude: number;
  longitude: number;
  caption: string | null;
  mood_tag: MoodTag | null;
  place_name: string | null;
  is_public: boolean;
  created_at: string;
}
