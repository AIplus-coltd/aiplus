"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const CUT_CONFIG_KEY = "editorCutConfig";
const FALLBACK_VIDEO = "https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerFun.mp4";

type Segment = { start: number; end: number };

type CutConfig = {
  videoUrl?: string;
  segments?: Segment[];
  applySegmentsPreview?: boolean;
};

export default function CutPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [themeColor, setThemeColor] = useState<string>("#2b7ba8");
  const [backgroundColor, setBackgroundColor] = useState<"light">("light");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [segmentsHistory, setSegmentsHistory] = useState<Segment[][]>([]);
  const [applySegmentsPreview, setApplySegmentsPreview] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);

  useEffect(() => {
    const savedSettings = localStorage.getItem("appSettings");
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    const color = settings.themeColor || "blue";
    const bgColor = settings.backgroundColor || "light";
    const themeMap: Record<string, string> = {
      pink: "#2b7ba8",
      blue: "#2b7ba8",
      green: "#2b7ba8",
      purple: "#2b7ba8",
    };
    setThemeColor(themeMap[color] || "#2b7ba8");
    setBackgroundColor(bgColor);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(CUT_CONFIG_KEY);
    if (saved) {
      try {
        const parsed: CutConfig = JSON.parse(saved);
        if (parsed.videoUrl) setVideoUrl(parsed.videoUrl);
        if (Array.isArray(parsed.segments)) setSegments(parsed.segments);
        if (typeof parsed.applySegmentsPreview === "boolean") setApplySegmentsPreview(parsed.applySegmentsPreview);
      } catch {}
    }
  }, []);

  const ensureInitialSegment = () => {
    if (!videoRef.current) return;
    const dur = Math.max(0, videoRef.current.duration || 0);
    if (dur === 0) return;
    setVideoDuration(dur);
    if (segments.length === 0) {
      setSegments([{ start: 0, end: Math.floor(dur) }]);
    }
  };

  const handleLoadedMetadata = () => {
    ensureInitialSegment();
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current || segments.length === 0 || !applySegmentsPreview) return;
    const t = videoRef.current.currentTime;
    const seg = segments[currentSegmentIndex] || segments[0];
    if (t < seg.start) {
      videoRef.current.currentTime = seg.start;
    } else if (t > seg.end) {
      const next = currentSegmentIndex + 1;
      if (next < segments.length) {
        setCurrentSegmentIndex(next);
        videoRef.current.currentTime = segments[next].start;
      } else {
        videoRef.current.pause();
      }
    }
  };

  const pushHistory = (prev: Segment[]) => {
    setSegmentsHistory((h) => [...h, prev.map((s) => ({ ...s }))]);
  };

  const handleSeekToSegment = (seg: Segment, idx: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(seg.start + 0.01, seg.start);
    setCurrentSegmentIndex(idx);
    videoRef.current.play().catch(() => {});
  };

  const undoLast = () => {
    setSegmentsHistory((h) => {
      if (h.length === 0) return h;
      const latest = h[h.length - 1];
      setSegments(latest);
      return h.slice(0, -1);
    });
  };

  const splitAtCurrent = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    if (segments.length === 0) {
      ensureInitialSegment();
    }
    let updated = [...segments];
    for (let i = 0; i < updated.length; i++) {
      const seg = updated[i];
      if (t > seg.start && t < seg.end) {
        // 近すぎる位置は無要E
        if (seg.end - seg.start < 0.2 || t - seg.start < 0.1 || seg.end - t < 0.1) return;
        const left: Segment = { start: seg.start, end: Number(t.toFixed(2)) };
        const right: Segment = { start: Number(t.toFixed(2)), end: seg.end };
        updated.splice(i, 1, left, right);
        break;
      }
    }
    updated = updated
      .sort((a, b) => a.start - b.start)
      .map((s) => ({ start: Number(s.start.toFixed(2)), end: Number(s.end.toFixed(2)) }));
    pushHistory(segments);
    setSegments(updated);
    setError("");
  };

  const removeSegment = (idx: number) => {
    setSegments((prev) => {
      pushHistory(prev);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const saveAndReturn = () => {
    if (!videoUrl) {
      setError("動画がありません。編集ページで動画を選択してください");
      return;
    }
    try {
      // セグメントが存在する場合のみ保存
      if (segments.length > 0) {
        const payload: CutConfig = {
          videoUrl,
          segments,
          applySegmentsPreview,
        };
        localStorage.setItem(CUT_CONFIG_KEY, JSON.stringify(payload));
      } else {
        // セグメントがない場合は設定をクリア
        localStorage.removeItem(CUT_CONFIG_KEY);
      }
    } catch {}
    router.push("/upload/editor");
  };

  const currentVideoUrl = videoUrl || FALLBACK_VIDEO;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "#ffffff",
        color: "#333",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: `1px solid ${themeColor}26`,
          background: "linear-gradient(180deg, rgba(245,245,245,.95) 0%, rgba(240,240,240,.93) 100%)",
          boxShadow: "0 2px 16px rgba(0,0,0,.08), inset 0 -1px 0 rgba(0,0,0,.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <button onClick={() => router.push("/upload/editor")} style={{ background: "transparent", border: "none", color: themeColor, cursor: "pointer", fontSize: 18 }}>
          ←
        </button>
        <div style={{ fontWeight: "bold", color: themeColor, textShadow: `0 0 16px ${themeColor}66`, fontSize: 18 }}>
          カット編集
        </div>
        <div style={{ width: 24 }} />
      </div>

      {/* メインコンテンツ - 動画と編集パネル */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", overflow: "hidden", padding: "6px 12px" }}>
        <div style={{ width: "100%", maxWidth: 375, display: "flex", flexDirection: "column", gap: 6, height: "100%" }}>
          
          {/* ビデオプレビュー - 9:16縦長（高さ制限） */}
          <div style={{ position: "relative", width: "100%", maxHeight: 450, aspectRatio: "9/16", borderRadius: 12, overflow: "hidden", background: "rgba(0,0,0,.8)", border: `1px solid ${themeColor}33`, flexShrink: 0 }}>
            {currentVideoUrl ? (
              <video
                ref={videoRef}
                src={currentVideoUrl}
                controls
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, textAlign: "center", opacity: 0.5 }}>編集ページで動画を選択</div>
            )}
          </div>

          {/* タイムライン + 区間リスト - スクロール禁止 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, minHeight: 0 }}>
            {/* タイムライン（カット位置表示）*/}
            {videoDuration > 0 && (
              <div style={{ background: "rgba(245,245,245,.95)", borderRadius: 8, padding: "4px 6px", border: `1px solid ${themeColor}33`, flexShrink: 0 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: themeColor, marginBottom: 3 }}>カット</div>
                <div style={{ position: "relative", height: 24, borderRadius: 6, background: "rgba(0,0,0,.15)", overflow: "hidden" }}>
                  {segments.length === 0 ? (
                    <div style={{ fontSize: 8, opacity: 0.6, textAlign: "center", lineHeight: "24px" }}>再生作成</div>
                  ) : (
                    segments.map((seg, idx) => {
                      const left = `${(seg.start / videoDuration) * 100}%`;
                      const width = `${((seg.end - seg.start) / videoDuration) * 100}%`;
                      const isActive = idx === currentSegmentIndex;
                      return (
                        <div
                          key={`${seg.start}-${seg.end}-${idx}`}
                          onClick={() => handleSeekToSegment(seg, idx)}
                          style={{
                            position: "absolute",
                            left,
                            width,
                            top: 2,
                            bottom: 2,
                            background: isActive ? `${themeColor}` : `${themeColor}aa`,
                            border: `1px solid ${themeColor}dd`,
                            borderRadius: 3,
                            boxShadow: `0 0 3px ${themeColor}55`,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: 7,
                            fontWeight: 700,
                          }}
                          title={`${seg.start}s - ${seg.end}s`}
                        >
                          {idx + 1}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* カット区間リスト - コンパクト */}
            {segments.length > 0 && (
              <div style={{ padding: 4, borderRadius: 6, border: `1px solid ${themeColor}33`, background: "rgba(245,245,245,.95)", flexShrink: 0 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: themeColor, marginBottom: 3 }}>{segments.length}区</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 70, overflowY: "auto" }}>
                  {segments.map((seg, idx) => (
                    <div
                      key={`${seg.start}-${seg.end}-${idx}`}
                      draggable
                      onDragStart={() => setDraggingIdx(idx)}
                      onDragEnd={() => setDraggingIdx(null)}
                      onClick={() => handleSeekToSegment(seg, idx)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        padding: "3px 4px",
                        borderRadius: 4,
                        border: `1px solid ${themeColor}33`,
                        background: draggingIdx === idx || idx === currentSegmentIndex ? `${themeColor}22` : "white",
                        fontSize: 8,
                        cursor: "grab",
                      }}
                    >
                      <span style={{ fontWeight: 700, color: themeColor, minWidth: 14, fontSize: 8 }}>{idx + 1}</span>
                      <span style={{ opacity: 0.8, flex: 1, fontSize: 8 }}>{seg.start}-{seg.end}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeSegment(idx); }}
                        style={{
                          padding: "1px 3px",
                          borderRadius: 3,
                          border: `1px solid ${themeColor}40`,
                          background: "white",
                          color: themeColor,
                          fontSize: 7,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ゴミ箱 - 超コンパクト */}
            {segments.length > 0 && (
              <div
                onDragOver={(e) => { if (draggingIdx !== null) e.preventDefault(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggingIdx !== null) removeSegment(draggingIdx);
                  setDraggingIdx(null);
                }}
                style={{
                  minHeight: 26,
                  border: `1px dashed ${draggingIdx !== null ? themeColor : `${themeColor}55`}`,
                  borderRadius: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: draggingIdx !== null ? `${themeColor}1a` : "rgba(245,245,245,.5)",
                  color: themeColor,
                  fontWeight: 700,
                  fontSize: 9,
                  transition: "all 0.2s",
                  flexShrink: 0,
                }}
              >
                🗑️ドラッグ削除
              </div>
            )}

            {error && (
              <div
                style={{
                  padding: 4,
                  borderRadius: 6,
                  border: "1px solid rgba(255,100,150,.3)",
                  background: "rgba(255,120,180,.1)",
                  color: "rgba(200,0,60,.9)",
                  fontSize: 9,
                  flexShrink: 0,
                }}
              >
                {error}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 下部コントロールバー - 一行 */}
      <div style={{
        padding: "6px 10px",
        borderTop: "1px solid rgba(0,0,0,.1)",
        background: "#fff",
        display: "flex",
        gap: 4,
        flexShrink: 0,
      }}>
        <button
          onClick={splitAtCurrent}
          style={{
            flex: "1 1 60px",
            padding: "6px 8px",
            borderRadius: 6,
            border: `1px solid ${themeColor}66`,
            background: `${themeColor}22`,
            color: themeColor,
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontSize: 12 }}>✂</span>カット
        </button>
        
        <button
          onClick={undoLast}
          disabled={segmentsHistory.length === 0}
          style={{
            flex: "1 1 60px",
            padding: "6px 8px",
            borderRadius: 6,
            border: `1px solid ${themeColor}33`,
            background: segmentsHistory.length === 0 ? "rgba(200,200,200,.3)" : `${themeColor}22`,
            color: segmentsHistory.length === 0 ? "#888" : themeColor,
            fontSize: 11,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            cursor: segmentsHistory.length === 0 ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          ↶ 戻す
        </button>

        <button
          onClick={() => segments.length > 0 && (setDraggingIdx(null), removeSegment(Math.max(0, currentSegmentIndex - 1)))}
          disabled={segments.length === 0}
          style={{
            flex: "1 1 60px",
            padding: "6px 8px",
            borderRadius: 6,
            border: `1px solid ${themeColor}33`,
            background: segments.length === 0 ? "rgba(200,200,200,.3)" : `${themeColor}22`,
            color: segments.length === 0 ? "#888" : themeColor,
            fontSize: 11,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            cursor: segments.length === 0 ? "not-allowed" : "pointer",
            whiteSpace: "nowrap",
          }}
        >
          🗑️ 削除
        </button>

        <button
          onClick={saveAndReturn}
          style={{
            flex: "1 1 60px",
            padding: "6px 8px",
            borderRadius: 6,
            border: "none",
            background: themeColor,
            color: "white",
            cursor: "pointer",
            fontSize: 11,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            whiteSpace: "nowrap",
            boxShadow: `0 2px 4px ${themeColor}55`,
          }}
        >
          💾 保存
        </button>
      </div>
    </div>
  );
}

