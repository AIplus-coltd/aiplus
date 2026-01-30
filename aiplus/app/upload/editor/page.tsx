"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadVideo } from "@/lib/storage";
import dynamic from "next/dynamic";
// CameraEffectは動的import（SSR無効）で読み込み
const CameraEffect = dynamic(() => import("@/components/CameraEffect"), { ssr: false });
  const [showCamera, setShowCamera] = useState(false);

type VideoRow = {
  id: string;
  user_id: string | null;
  title: string | null;
  description?: string;
  video_url: string;
  created_at: string;
  hashtags?: string[];
  aiScore?: number;
  trimStart?: number;
  trimEnd?: number;
  muted?: boolean;
  coverTime?: number;
};

export default function EditBeforePostPage() {
  const router = useRouter();
  const [themeColor, setThemeColor] = useState<string>("#ff1493");
  const [backgroundColor, setBackgroundColor] = useState<"dark" | "light">("dark");
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [muted, setMuted] = useState(false);
  const [coverTime, setCoverTime] = useState(0);
  const [useSupabase, setUseSupabase] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [segments, setSegments] = useState<{ start: number; end: number }[]>([]);
  const [applySegmentsPreview, setApplySegmentsPreview] = useState(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [hue, setHue] = useState(0);
  const [blur, setBlur] = useState(0);
  const [filterMode, setFilterMode] = useState<"none" | "bw" | "beauty" | "simple" | "sparkle">("none");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [musicUrl, setMusicUrl] = useState<string>("");
  const [musicVolume, setMusicVolume] = useState(70);
  const [musicSourceMode, setMusicSourceMode] = useState<"file" | "url" | "none">("file");
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const [sfxCues, setSfxCues] = useState<{ time: number; type: "beep" | "pop" | "whoosh"; volume: number }[]>([]);
  const sfxFiredRef = useRef<Set<number>>(new Set());
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const savedSettings = localStorage.getItem("appSettings");
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    const color = settings.themeColor || "pink";
    const bgColor = settings.backgroundColor || "dark";
    const themeMap: Record<string, string> = {
      pink: "#ff1493",
      blue: "#64b5f6",
      green: "#81c784",
      purple: "#9d4edd",
    };
    setThemeColor(themeMap[color] || "#ff1493");
    setBackgroundColor(bgColor);

    // カット設定を読み込む
    const cutConfig = localStorage.getItem("editorCutConfig");
    if (cutConfig) {
      try {
        const parsed = JSON.parse(cutConfig);
        // セグメントがある場合のみ読み込む
        if (parsed.segments && Array.isArray(parsed.segments) && parsed.segments.length > 0) {
          // videoUrl が既に存在しない場合のみ設定
          if (!videoUrl && parsed.videoUrl) {
            setVideoUrl(parsed.videoUrl);
          }
          setSegments(parsed.segments);
          if (parsed.applySegmentsPreview !== undefined) {
            setApplySegmentsPreview(parsed.applySegmentsPreview);
          }
        }
      } catch {}
    }

    const handleThemeChange = (e: Event) => {
      const ce = e as CustomEvent;
      if (ce.detail) {
        const colorKey = ce.detail.themeColor || "pink";
        const bgKey = ce.detail.backgroundColor || "dark";
        const tm: Record<string, string> = {
          pink: "#ff1493",
          blue: "#64b5f6",
          green: "#81c784",
          purple: "#9d4edd",
        };
        setThemeColor(tm[colorKey] || "#ff1493");
        setBackgroundColor(bgKey);
      }
    };
    window.addEventListener("themeChanged", handleThemeChange);
    return () => window.removeEventListener("themeChanged", handleThemeChange);
  }, []);

  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.volume = musicVolume / 100;
    }
  }, [musicVolume]);

  const getFilterCSS = () => {
    let filters = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hue}deg) blur(${blur}px)`;
    
    switch (filterMode) {
      case "bw":
        filters += " grayscale(100%)";
        break;
      case "beauty":
        filters += " brightness(105%) blur(1px)";
        break;
      case "simple":
        filters += " saturate(50%)";
        break;
      case "sparkle":
        filters += " brightness(110%) saturate(120%)";
        break;
      default:
        break;
    }
    
    return filters;
  };

  const applyFilterPreset = (mode: "none" | "bw" | "beauty" | "simple" | "sparkle") => {
    setFilterMode(mode);
    switch (mode) {
      case "bw":
        setContrast(110);
        break;
      case "beauty":
        setBrightness(102);
        setContrast(95);
        setSaturation(110);
        break;
      case "simple":
        setSaturation(50);
        setContrast(110);
        break;
      case "sparkle":
        setBrightness(110);
        setSaturation(120);
        setContrast(105);
        break;
      case "none":
        setBrightness(100);
        setContrast(100);
        setSaturation(100);
        setHue(0);
        break;
    }
    setShowFilterMenu(false);
  };

  const handleFile = (f: File | null) => {
    setFile(f);
    setError("");
    if (f) {
      const url = URL.createObjectURL(f);
      setVideoUrl(url);
      setTrimStart(0);
      setTrimEnd(0);
      setCoverTime(0);
    } else {
      setVideoUrl("");
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      const dur = videoRef.current.duration || 0;
      setTrimEnd(Math.floor(dur));
      setCoverTime(Math.min(Math.floor(dur / 2), Math.floor(dur)));
    }
  };

  const handleCoverSeek = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = coverTime;
    }
  };

  const ensureAudioCtx = () => {
    if (!audioCtxRef.current) {
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AC) audioCtxRef.current = new AC();
    }
    return audioCtxRef.current;
  };

  const playSfx = (type: "beep" | "pop" | "whoosh", volume: number) => {
    const ctx = ensureAudioCtx();
    if (!ctx) return;
    const gain = ctx.createGain();
    gain.gain.value = Math.max(0, Math.min(1, volume / 100));
    gain.connect(ctx.destination);

    if (type === "beep" || type === "pop") {
      const osc = ctx.createOscillator();
      osc.type = type === "beep" ? "sine" : "triangle";
      osc.frequency.value = type === "beep" ? 660 : 440;
      osc.connect(gain);
      const now = ctx.currentTime;
      osc.start(now);
      osc.stop(now + 0.15);
    } else if (type === "whoosh") {
      const bufferSize = 2 * 44100;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, 44100);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 800;
      noise.connect(filter);
      filter.connect(gain);
      const now = ctx.currentTime;
      noise.start(now);
      noise.stop(now + 0.25);
    }
  };

  const handleVideoPlay = () => {
    // ビデオ要素が見えているか確認
    if (videoRef.current) {
      const rect = videoRef.current.getBoundingClientRect();
      console.log("Video play - width:", rect.width, "height:", rect.height);
      console.log("Video play - visibility:", getComputedStyle(videoRef.current).visibility);
      console.log("Video play - display:", getComputedStyle(videoRef.current).display);
      console.log("Video play - opacity:", getComputedStyle(videoRef.current).opacity);
      console.log("Video element readyState:", videoRef.current.readyState);
      console.log("Video element networkState:", videoRef.current.networkState);
    }
    if (musicRef.current) {
      musicRef.current.volume = Math.max(0, Math.min(1, musicVolume / 100));
      try {
        musicRef.current.currentTime = videoRef.current?.currentTime || 0;
      } catch {}
      musicRef.current.play().catch(() => {});
    }
    ensureAudioCtx();
  };

  const handleVideoPause = () => {
    if (musicRef.current) {
      try { musicRef.current.pause(); } catch {}
    }
  };

  const handleVideoSeeking = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    if (musicRef.current) {
      try { musicRef.current.currentTime = t; } catch {}
    }
    sfxFiredRef.current.clear();
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const t = videoRef.current.currentTime;
    if (musicRef.current && !musicRef.current.paused) {
      const diff = Math.abs((musicRef.current.currentTime || 0) - t);
      if (diff > 0.2) {
        try { musicRef.current.currentTime = t; } catch {}
      }
      musicRef.current.volume = Math.max(0, Math.min(1, musicVolume / 100));
    }

    if (applySegmentsPreview && segments.length > 0) {
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
    }

    for (let i = 0; i < sfxCues.length; i++) {
      const cue = sfxCues[i];
      if (!sfxFiredRef.current.has(i) && t >= cue.time) {
        sfxFiredRef.current.add(i);
        playSfx(cue.type, cue.volume);
      }
    }
  };

  const savePost = async () => {
    setLoading(true);
    setError("");

    const userId = "test-user-" + Date.now();
    let finalUrl = videoUrl;

    try {
      if (useSupabase && file) {
        const result = await uploadVideo(file, userId);
        finalUrl = result.publicUrl;
      } else if (file && !videoUrl) {
        const url = URL.createObjectURL(file);
        finalUrl = url;
      } else if (!finalUrl) {
        finalUrl = "https://commondatastorage.googleapis.com/gtv-videos-library/sample/ForBiggerFun.mp4";
      }

      // セッションに保存
      const session = {
        videoUrl: finalUrl,
        coverTime,
        brightness,
        contrast,
        saturation,
        hue,
        blur,
        musicUrl,
        musicVolume,
        muted,
        segments,
      };
      localStorage.setItem("editorSession", JSON.stringify(session));

      setLoading(false);
      router.push("/upload/thumb");
    } catch (err) {
      setLoading(false);
      setError("エラーが発生しました: " + (err as Error).message);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: backgroundColor === "light"
          ? "#ffffff"
          : "linear-gradient(135deg, rgba(10,0,20,.98) 0%, rgba(15,5,25,.96) 100%)",
        color: backgroundColor === "light" ? "#333" : "white",
      }}
    >
      {/* ヘッダー */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: backgroundColor === "light" ? `1px solid ${themeColor}26` : `1px solid ${themeColor}40`,
          background: backgroundColor === "light"
            ? "linear-gradient(180deg, rgba(245,245,245,.95) 0%, rgba(240,240,240,.93) 100%)"
            : "linear-gradient(180deg, rgba(20,0,40,.95) 0%, rgba(30,5,60,.93) 100%)",
          boxShadow: backgroundColor === "light"
            ? "0 2px 16px rgba(0,0,0,.08), inset 0 -1px 0 rgba(0,0,0,.05)"
            : `0 2px 16px ${themeColor}33, inset 0 -1px 0 ${themeColor}1a`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <button
          onClick={() => router.back()}
          style={{ background: "transparent", border: "none", color: themeColor, cursor: "pointer", fontSize: 18 }}
        >
          ←
        </button>
        <div style={{ fontWeight: "bold", color: themeColor, textShadow: `0 0 16px ${themeColor}66`, fontSize: 18 }}>
          編集して投稿
        </div>
        <div style={{ width: 24 }} />
      </div>

      {/* コンテンツ - 携帯画面サイズ */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", overflow: "auto", padding: 16 }}>
        <div style={{ width: 375, display: "flex", flexDirection: "column", gap: 16, maxHeight: "100%" }}>
          
          {/* プレビュー + 右側ツール */}
          <div style={{ position: "relative", width: "100%", aspectRatio: "9/16", borderRadius: 12, overflow: "hidden", background: "rgba(0,0,0,.8)" }}>
            {videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                controls
                muted={muted}
                onLoadedMetadata={handleLoadedMetadata}
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                onSeeking={handleVideoSeeking}
                onTimeUpdate={handleTimeUpdate}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  filter: getFilterCSS(),
                }}
              />
            ) : (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, textAlign: "center", opacity: 0.5 }}>動画を選択</div>
            )}
            
            {/* 右側編集ツール（プレビュー内に重ねる） */}
            <div style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 10, zIndex: 10 }}>
              
              {/* トリミング */}
              <button
                onClick={() => {
                  // カットページに動画情報を引き継ぐ
                  if (videoUrl) {
                    const cutConfig = {
                      videoUrl: videoUrl,
                      segments: segments,
                      applySegmentsPreview: applySegmentsPreview,
                    };
                    localStorage.setItem("editorCutConfig", JSON.stringify(cutConfig));
                  }
                  router.push("/upload/cut");
                }}
                style={{ width: 48, height: 48, borderRadius: 999, border: `1px solid ${themeColor}80`, background: `linear-gradient(135deg, ${themeColor}66, ${themeColor}4d)`, backdropFilter: "blur(10px)", color: "white", cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,.4)" }}
                title="カット編集"
              >
                ✂
              </button>

              {/* フィルター */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  style={{ width: 48, height: 48, borderRadius: 999, border: `1px solid ${themeColor}80`, background: `linear-gradient(135deg, ${themeColor}66, ${themeColor}4d)`, backdropFilter: "blur(10px)", color: "white", cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,.4)" }}
                  title="フィルター"
                >
                  🎨
                </button>

                {showFilterMenu && (
                  <div style={{
                    position: "absolute",
                    bottom: 56,
                    left: -120,
                    background: backgroundColor === "light" ? "#f5f5f5" : `${themeColor}1a`,
                    border: `1px solid ${themeColor}40`,
                    borderRadius: 12,
                    padding: 8,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    minWidth: 140,
                    boxShadow: `0 4px 20px ${themeColor}33`,
                    backdropFilter: "blur(20px)",
                    zIndex: 100,
                  }}>
                    {[
                      { label: "なし", mode: "none" as const },
                      { label: "白黒", mode: "bw" as const },
                      { label: "美肌", mode: "beauty" as const },
                      { label: "シンプル", mode: "simple" as const },
                      { label: "キラキラ", mode: "sparkle" as const },
                    ].map((f) => (
                      <button
                        key={f.mode}
                        onClick={() => applyFilterPreset(f.mode)}
                        style={{
                          padding: "8px 12px",
                          border: filterMode === f.mode ? `2px solid ${themeColor}` : `1px solid ${themeColor}40`,
                          background: filterMode === f.mode ? `${themeColor}33` : "transparent",
                          borderRadius: 8,
                          color: backgroundColor === "light" ? "#333" : "white",
                          cursor: "pointer",
                          fontSize: 12,
                          fontWeight: filterMode === f.mode ? 700 : 400,
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* 音楽 */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => {
                    if (musicRef.current) {
                      if (musicRef.current.paused) {
                        musicRef.current.play().catch(e => console.error("再生エラー:", e));
                      } else {
                        musicRef.current.pause();
                      }
                    } else {
                      const url = prompt("音楽URL:", musicUrl);
                      if (url !== null) setMusicUrl(url);
                    }
                  }}
                  style={{ width: 48, height: 48, borderRadius: 999, border: `1px solid ${themeColor}80`, background: `linear-gradient(135deg, ${themeColor}66, ${themeColor}4d)`, backdropFilter: "blur(10px)", color: "white", cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,.4)" }}
                  title={musicUrl ? (musicRef.current?.paused ? "再生" : "一時停止") : "音楽URL設定"}
                >
                  {musicUrl ? (musicRef.current?.paused ? "⏸" : "▶") : "🎵"}
                </button>
              </div>

              {/* ミュート */}
              <button
                onClick={() => setMuted(!muted)}
                style={{ width: 48, height: 48, borderRadius: 999, border: `1px solid ${muted ? "white" : `${themeColor}80`}`, background: muted ? `linear-gradient(135deg, ${themeColor}a6, ${themeColor}80)` : `linear-gradient(135deg, ${themeColor}66, ${themeColor}4d)`, backdropFilter: "blur(10px)", color: "white", cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,.4)" }}
                title={muted ? "ミュート中" : "音声あり"}
              >
                {muted ? "🔇" : "🔊"}
              </button>

              {/* カメラ撮影ボタン */}
              <button
                onClick={() => setShowCamera(true)}
                style={{ width: 48, height: 48, borderRadius: 999, border: `1px solid ${themeColor}80`, background: `linear-gradient(135deg, #1976d2, #64b5f6)`, color: "white", cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,.4)" }}
                title="カメラで撮影"
              >
                📷
              </button>
              {/* ファイル選択 */}
              <label
                style={{ width: 48, height: 48, borderRadius: 999, border: `1px solid ${themeColor}80`, background: `linear-gradient(135deg, ${themeColor}66, ${themeColor}4d)`, backdropFilter: "blur(10px)", color: "white", cursor: "pointer", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(0,0,0,.4)" }}
                title="動画ファイル"
              >
                📁
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                  style={{ display: "none" }}
                />
              </label>
      {/* カメラエフェクト表示 */}
      {showCamera && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "relative" }}>
            <CameraEffect />
            <button onClick={() => setShowCamera(false)} style={{ position: "absolute", top: 8, right: 8, background: "#fff", color: "#1976d2", border: "none", borderRadius: 8, padding: "8px 16px", fontWeight: 700, cursor: "pointer", fontSize: 16 }}>閉じる</button>
          </div>
        </div>
      )}

            </div>
          </div>
          
          {musicUrl && (
            <audio 
              ref={musicRef} 
              src={musicUrl} 
              preload="auto"
              loop
              style={{ display: "none" }}
            />
          )}

          {error && (
            <div
              style={{
                padding: 10,
                borderRadius: 8,
                border: `1px solid rgba(255,100,150,.4)`,
                background: "rgba(255,120,180,.12)",
                color: "rgba(255,210,230,.9)",
                fontSize: 12,
              }}
            >
              {error}
            </div>
          )}

          {/* 次へボタン */}
          <button
            onClick={savePost}
            disabled={loading}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: loading ? `1px solid ${themeColor}4d` : `1px solid ${themeColor}80`,
              background: loading ? `linear-gradient(135deg, ${themeColor}4d, ${themeColor}33)` : `linear-gradient(135deg, ${themeColor}bf, ${themeColor}a6)`,
              color: loading ? `${themeColor}90` : "white",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 13,
              fontWeight: 700,
              boxShadow: loading ? "none" : `0 0 12px ${themeColor}66`,
            }}
          >
            {loading ? "読み込み中..." : "次へ"}
          </button>

          <button
            onClick={() => router.back()}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 8,
              border: `1px solid ${themeColor}40`,
              background: "transparent",
              color: themeColor,
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            キャンセル
          </button>

        </div>
      </div>
    </div>
  );
}
