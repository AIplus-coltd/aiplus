import { supabase } from "@/lib/supabase/client";

export async function uploadVideo(file: File, userId: string) {
  // 拡張子（mp4等）を取る
  const ext = file.name.split(".").pop() || "mp4";

  // 保存パス（例：userId/日時.mp4）
  const filePath = `${userId}/${Date.now()}.${ext}`;

  // Supabase Storage にアップロード
  const { error: uploadError } = await supabase.storage
    .from("videos") // ← バケット名
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (uploadError) throw uploadError;

  // 公開URLを取得（バケットが public の場合）
  const { data } = supabase.storage.from("videos").getPublicUrl(filePath);

  return {
    path: filePath,
    publicUrl: data.publicUrl,
  };
}