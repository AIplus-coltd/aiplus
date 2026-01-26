/**
 * テスト用の動画ファイルを生成し、Supabase にアップロードするスクリプト
 * node scripts/test-upload.js で実行
 */

const path = require("path");
const fs = require("fs");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = "https://bozypsmrjsfizhraftiq.supabase.com";
const supabaseServiceKey = "sb_secret_WXI-svZdf_UAi2mDifVkDg_e_UncrSD";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function uploadTestVideo() {
  try {
    console.log("📹 テスト用動画を生成中...");

    // テスト用の小さなバイナリファイルを生成（MP4 ヘッダー含む）
    const testVideoBuffer = Buffer.from([
      0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, // ftyp
      0x69, 0x73, 0x6f, 0x6d, 0x00, 0x00, 0x00, 0x00,
      0x69, 0x73, 0x6f, 0x6d, 0x69, 0x73, 0x6f, 0x32,
      0x61, 0x76, 0x63, 0x31, 0x6d, 0x70, 0x34, 0x31,
    ]);

    const userId = "test-user-" + Date.now();
    const fileName = `${userId}/test-video-${Date.now()}.mp4`;

    console.log(`📤 動画をアップロード中: ${fileName}`);

    const { data, error } = await supabase.storage
      .from("videos")
      .upload(fileName, testVideoBuffer, {
        contentType: "video/mp4",
        upsert: false,
      });

    if (error) {
      console.error("❌ アップロード失敗:", error);
      return;
    }

    console.log("✅ アップロード成功:", data);

    // 公開 URL を取得
    const { data: publicUrlData } = supabase.storage
      .from("videos")
      .getPublicUrl(data.path);

    console.log("🔗 公開 URL:", publicUrlData.publicUrl);

    // DB に登録
    console.log("💾 DB に登録中...");
    const { error: dbError } = await supabase.from("videos").insert({
      user_id: userId,
      title: "テスト動画 " + new Date().toLocaleString(),
      video_url: publicUrlData.publicUrl,
    });

    if (dbError) {
      console.error("❌ DB 登録失敗:", dbError);
      return;
    }

    console.log("🎉 テスト完了！動画がアップロードされました");
  } catch (error) {
    console.error("💥 エラー:", error);
  }
}

uploadTestVideo();
