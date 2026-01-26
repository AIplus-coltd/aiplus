/**
 * ハイブリッドストレージ - Supabase とローカルストレージを自動切り替え
 * Supabase が利用可能な場合は優先、失敗時は localStorage にフォールバック
 */

import { supabase } from "./supabase/client";

/**
 * データを保存（Supabase またはローカルストレージ）
 */
export async function hybridSet(key: string, value: any): Promise<void> {
  // ローカルストレージに保存（高速アクセス）
  localStorage.setItem(key, JSON.stringify(value));

  // Supabase に保存を試みる（バックグラウンド）
  try {
    const { error } = await supabase
      .from("app_data")
      .upsert({ key, value: JSON.stringify(value) }, { onConflict: "key" });

    if (error) {
      console.log(`Supabase save failed for ${key}, using localStorage`);
    }
  } catch (err) {
    console.log(`Supabase unavailable for ${key}, using localStorage`);
  }
}

/**
 * データを取得（ローカルストレージ優先、Supabase からも同期）
 */
export async function hybridGet(key: string): Promise<any> {
  // ローカルストレージから即座に取得
  const localData = localStorage.getItem(key);
  if (localData) {
    try {
      return JSON.parse(localData);
    } catch {
      return localData;
    }
  }

  // Supabase から取得を試みる
  try {
    const { data, error } = await supabase
      .from("app_data")
      .select("value")
      .eq("key", key)
      .single();

    if (!error && data) {
      const value = JSON.parse(data.value);
      // ローカルストレージに同期
      localStorage.setItem(key, JSON.stringify(value));
      return value;
    }
  } catch (err) {
    console.log(`Supabase fetch failed for ${key}`);
  }

  return null;
}

/**
 * Supabase の状態を確認（接続可能かどうか）
 */
export async function isSupabaseAvailable(): Promise<boolean> {
  try {
    const { error } = await supabase.from("app_data").select("count").limit(1);
    return !error;
  } catch {
    return false;
  }
}
