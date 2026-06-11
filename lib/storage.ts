import * as ImageManipulator from "expo-image-manipulator";
import { supabase } from "./supabase";

export async function uploadMemoryImage(uri: string, userId: string): Promise<string> {
  const { uri: compressedUri } = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 1200 } }],
    { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
  );

  const response = await fetch(compressedUri);
  const arrayBuffer = await response.arrayBuffer();

  const path = `${userId}/${Date.now()}.jpg`;

  const { error } = await supabase.storage
    .from("memories")
    .upload(path, arrayBuffer, { contentType: "image/jpeg" });

  if (error) throw error;

  const { data } = supabase.storage.from("memories").getPublicUrl(path);
  return data.publicUrl;
}
