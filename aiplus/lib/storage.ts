import { supabase } from "@/lib/supabase/client";

export async function uploadVideo(file: File, userId: string) {
  const fileName = `${userId}/${Date.now()}_${file.name}`;
  const bucketName = "videos";

  // Supabase Storage へアップロード
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`アップロード失敗: ${error.message}`);
  }

  // 公開 URL を取得
  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(data.path);

  return {
    path: data.path,
    publicUrl: publicUrlData.publicUrl,
  };
}
