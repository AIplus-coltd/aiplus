/**
 * Supabase Storage bucket を初期化するスクリプト
 * npm run init-storage で実行してください
 */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env.local") });
const { createClient } = require("@supabase/supabase-js");

// 直接環境変数を読み込む
const supabaseUrl = "https://bozypsmrjsfizhraftiq.supabase.co";
const supabaseServiceKey = "sb_secret_WXI-svZdf_UAi2mDifVkDg_e_UncrSD";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "エラー: NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY が必要です"
  );
  console.error("注: SUPABASE_SERVICE_ROLE_KEY を .env.local に追加してください");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function initializeStorage() {
  try {
    console.log("📦 Storage bucket を初期化中...");

    // videos bucket を作成
    const { data, error } = await supabase.storage.createBucket("videos", {
      public: true,
    });

    if (error) {
      if (error.message.includes("already exists")) {
        console.log("✅ videos bucket は既に存在します");
      } else {
        throw error;
      }
    } else {
      console.log("✅ videos bucket を作成しました");
    }

    console.log("🎉 Storage の初期化が完了しました！");
  } catch (error) {
    console.error("❌ エラーが発生しました:", error);
    process.exit(1);
  }
}

initializeStorage();
