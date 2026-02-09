"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const DRAFT_KEY = "draftVideos";
const SESSION_KEY = "editorSession";

type DraftRow = {
  id: string;
  user_id: string | null;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url?: string;
  created_at: string;
  hashtags?: string[];
  session?: DraftSession;
};

type DraftSession = {
  videoUrl?: string;
  thumbnailDataUrl?: string;
  [key: string]: unknown;
};

const getInitialThemeColor = () => {
  if (typeof window === "undefined") return "#2b7ba8";
  const savedSettings = localStorage.getItem("appSettings");
  if (!savedSettings) return "#2b7ba8";
  try {
    const settings = JSON.parse(savedSettings);
    const color = settings.themeColor || "blue";
    const themeMap: Record<string, string> = {
      pink: "#2b7ba8",
      blue: "#2b7ba8",
      green: "#2b7ba8",
      purple: "#2b7ba8",
    };
    return themeMap[color] || "#2b7ba8";
  } catch {
    return "#2b7ba8";
  }
};

const getInitialDrafts = (): DraftRow[] => {
  if (typeof window === "undefined") return [];
  const savedDrafts = localStorage.getItem(DRAFT_KEY);
  if (!savedDrafts) return [];
  try {
    const parsed = JSON.parse(savedDrafts);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export default function DraftPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<DraftRow[]>(() => getInitialDrafts());
  const [themeColor] = useState<string>(() => getInitialThemeColor());

  const deleteDraft = (id: string) => {
    const updated = drafts.filter((d) => d.id !== id);
    setDrafts(updated);
    localStorage.setItem(DRAFT_KEY, JSON.stringify(updated));
  };

  const editDraft = (draft: DraftRow) => {
    // セチE��ョンを復允E��てエチE��ターへ
    const sessionData = draft.session || {
      videoUrl: draft.video_url,
      thumbnailDataUrl: draft.thumbnail_url,
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    router.push("/upload/editor");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "#ffffff",
        color: "#333",
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
          paddingTop: 12,
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "rgba(80,80,80,.7)",
            border: "none",
            color: "white",
            fontSize: 20,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ↁE
        </button>
        <div style={{ fontSize: 18, fontWeight: 700 }}>ドラフト</div>
      </div>

      {drafts.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            flex: 1,
            opacity: 0.6,
          }}
        >
          <div style={{ fontSize: 48 }}>📋</div>
          <div style={{ fontSize: 14, textAlign: "center" }}>ドラフトはまだありません</div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>メタページで「下書き保存」してください</div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr" }}>
          {drafts.map((draft) => (
            <div
              key={draft.id}
              style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr auto",
                gap: 12,
                padding: 16,
                borderRadius: 12,
                border: `1px solid ${themeColor}33`,
                background: `linear-gradient(135deg, ${themeColor}0d, ${themeColor}06)`,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 120,
                  height: 68,
                  borderRadius: 10,
                  overflow: "hidden",
                  border: `1px solid ${themeColor}40`,
                  background: `linear-gradient(135deg, ${themeColor}33, ${themeColor}1a)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {draft.thumbnail_url ? (
                  <img
                    src={draft.thumbnail_url}
                    alt="thumb"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <span style={{ fontSize: 24, opacity: 0.7 }}>🎬</span>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{draft.title || "(無顁E"}</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>{draft.created_at ? new Date(draft.created_at).toLocaleString() : ""}</div>
                {draft.description && (
                  <div style={{ fontSize: 12, opacity: 0.6 }}>{draft.description}</div>
                )}
                {draft.hashtags && draft.hashtags.length > 0 && (
                  <div style={{ fontSize: 12, opacity: 0.75, color: themeColor }}>
                    {draft.hashtags.join(" ")}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  onClick={() => editDraft(draft)}
                  style={{
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: `1px solid ${themeColor}66`,
                    background: `linear-gradient(135deg, ${themeColor}4d, ${themeColor}33)`,
                    color: "white",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  ✏︁E編雁E
                </button>
                <button
                  onClick={() => deleteDraft(draft.id)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    border: "1px solid rgba(255,68,88,.5)",
                    background: "rgba(255,68,88,.1)",
                    color: "#ff4458",
                    fontSize: 16,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  🗑�E�E
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

