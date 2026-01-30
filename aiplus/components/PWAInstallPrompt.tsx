"use client";

import { useEffect } from "react";

export function PWAInstallPrompt() {
  useEffect(() => {
    // 開発環境では Service Worker を登録しない
    if (process.env.NODE_ENV === 'production' && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered:", registration);
        })
        .catch((error) => {
          console.log("Service Worker registration failed:", error);
        });
    }

    // インスト�Eルプロンプトイベント�E処琁E
    let deferredPrompt: any;

    const handleBeforeInstallPrompt = (e: Event) => {
      // チE��ォルト�Eインスト�Eルプロンプトを防ぁE
      (e as any).preventDefault();
      deferredPrompt = e;
      // インスト�Eル可能フラグを設宁E
      window.dispatchEvent(
        new CustomEvent("pwaReady", { detail: { prompt: deferredPrompt } })
      );
    };

    const handleAppInstalled = () => {
      console.log("AI+ が�Eーム画面に追加されました");
      deferredPrompt = null;
      window.dispatchEvent(new CustomEvent("pwaInstalled"));
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  return null;
}

