"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { uploadVideo } from "@/lib/storage";

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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hashtags, setHashtags] = useState("");
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

  const hashtagArray = useMemo(() => {
    return hashtags
      .split(/\s+/)
      .filter((t) => t.startsWith("#"))
      .map((t) => t.toLowerCase());
  }, [hashtags]);

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
    if (!title.trim()) {
      setError("タイトルを入力してください");
      return;
    }

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

      const mockVideos = localStorage.getItem("mockVideos");
      const videos: VideoRow[] = mockVideos ? JSON.parse(mockVideos) : [];
      const aiScore = Math.floor(Math.random() * 40) + 60;

      const now = new Date().toISOString();
      const newVideo: VideoRow = {
        id: "video-" + Date.now(),
        user_id: userId,
        title: title.trim(),
        description: description.trim(),
        video_url: finalUrl,
        created_at: now,
        hashtags: hashtagArray,
        aiScore,
        trimStart: Math.max(0, trimStart),
        trimEnd: trimEnd > 0 ? trimEnd : undefined,
        muted,
        coverTime,
        // 以下、編集設定の保存
        // 型拡張を許容するために as any を使用
        ...( {
          segments,
          filters: { brightness, contrast, saturation, hue, blur },
          music: { enabled: !!musicUrl, volume: musicVolume, url: musicUrl },
          sfxCues,
        } as any ),
      };

      videos.unshift(newVideo);
      localStorage.setItem("mockVideos", JSON.stringify(videos));

      setLoading(false);
      router.push("/tabs/me/posts");
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

      {/* コンテンツ */}
      <div style={{ flex: 1, padding: 16, display: "flex", flexDirection: "column", gap: 16 }}>
        {/* プレビューエリア */}
        <div
          style={{
            padding: 14,
            borderRadius: 12,
            border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.08)" : themeColor}40`,
            background: backgroundColor === "light"
              ? `linear-gradient(135deg, ${themeColor}05, ${themeColor}02)`
              : `linear-gradient(135deg, ${themeColor}18, ${themeColor}0d)`,
            boxShadow: backgroundColor === "light" ? "0 6px 18px rgba(0,0,0,.06)" : `0 8px 22px ${themeColor}22`,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: themeColor }}>動画プレビュー</div>
            {videoUrl && (
              <span style={{ fontSize: 12, opacity: 0.75 }}>トリミング位置: {trimStart}s - {trimEnd}s</span>
            )}
          </div>
          <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", minHeight: 180, background: "rgba(0,0,0,.25)" }}>
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
                  filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hue}deg) blur(${blur}px)`,
                }}
              />
            ) : (
              <div style={{ padding: 20, textAlign: "center", opacity: 0.7 }}>動画を選択するとここに表示されます</div>
            )}
          </div>
          {musicUrl && (
            <audio ref={musicRef} src={musicUrl} preload="auto" />
          )}
          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, opacity: 0.8 }}>開始 (秒)</label>
              <input
                type="number"
                min={0}
                value={trimStart}
                onChange={(e) => setTrimStart(Math.max(0, Number(e.target.value) || 0))}
                style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${themeColor}40`, background: "rgba(0,0,0,.1)", color: "inherit" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, opacity: 0.8 }}>終了 (秒)</label>
              <input
                type="number"
                min={0}
                value={trimEnd}
                onChange={(e) => setTrimEnd(Math.max(0, Number(e.target.value) || 0))}
                style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${themeColor}40`, background: "rgba(0,0,0,.1)", color: "inherit" }}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, opacity: 0.8 }}>カバー位置 (秒)</label>
              <input
                type="number"
                min={0}
                value={coverTime}
                onChange={(e) => setCoverTime(Math.max(0, Number(e.target.value) || 0))}
                onBlur={handleCoverSeek}
                style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${themeColor}40`, background: "rgba(0,0,0,.1)", color: "inherit" }}
              />
            </div>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <input type="checkbox" checked={muted} onChange={(e) => setMuted(e.target.checked)} />
            音声をミュートして投稿する
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
            <input type="checkbox" checked={applySegmentsPreview} onChange={(e) => setApplySegmentsPreview(e.target.checked)} />
            カット区間でプレビュー再生
          </label>
        </div>

        {/* 入力フォーム */}
        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <label style={{ display: "block", marginBottom: 6, opacity: 0.85, color: themeColor, fontWeight: 700 }}>タイトル</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="例: 1分でわかる旅の持ち物"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.12)" : themeColor}40`,
                background: backgroundColor === "light" ? "#ffffff" : `linear-gradient(135deg, ${themeColor}1a, ${themeColor}0d)`,
                color: backgroundColor === "light" ? "#333" : "rgba(255,240,255,.95)",
              }}
            />
            <div style={{ fontSize: 12, marginTop: 4, opacity: 0.6 }}>{title.length}/120</div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, opacity: 0.85, color: themeColor, fontWeight: 700 }}>説明文</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={250}
              rows={3}
              placeholder="動画の内容、CTA、クレジットなどを記載"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.12)" : themeColor}40`,
                background: backgroundColor === "light" ? "#ffffff" : `linear-gradient(135deg, ${themeColor}1a, ${themeColor}0d)`,
                color: backgroundColor === "light" ? "#333" : "rgba(255,240,255,.95)",
              }}
            />
            <div style={{ fontSize: 12, marginTop: 4, opacity: 0.6 }}>{description.length}/250</div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, opacity: 0.85, color: themeColor, fontWeight: 700 }}>ハッシュタグ</label>
            <input
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              maxLength={120}
              placeholder="#旅 #グルメ #howto"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.12)" : themeColor}40`,
                background: backgroundColor === "light" ? "#ffffff" : `linear-gradient(135deg, ${themeColor}1a, ${themeColor}0d)`,
                color: backgroundColor === "light" ? "#333" : "rgba(255,240,255,.95)",
              }}
            />
            <div style={{ fontSize: 12, marginTop: 4, opacity: 0.6 }}># で始まる単語をスペース区切りで入力</div>
          </div>

          <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 12, opacity: 0.85 }}>ビデオファイル</label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${themeColor}40`, background: backgroundColor === "light" ? "#ffffff" : `linear-gradient(135deg, ${themeColor}12, ${themeColor}08)`, color: backgroundColor === "light" ? "#333" : "rgba(255,240,255,.9)" }}
              />
              {file && (
                <div style={{ fontSize: 12, opacity: 0.75 }}>
                  ✓ {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12, borderRadius: 10, border: `1px solid ${themeColor}33`, background: backgroundColor === "light" ? "#fafafa" : `linear-gradient(135deg, ${themeColor}0d, ${themeColor}06)` }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={useSupabase} onChange={(e) => setUseSupabase(e.target.checked)} />
                Supabase Storage を使ってアップロードする
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={muted} onChange={(e) => setMuted(e.target.checked)} />
                ミュートで投稿
              </label>
              <div style={{ fontSize: 11, opacity: 0.75 }}>
                ファイル未選択の場合はテスト用動画を使用します。
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 12, borderRadius: 10, border: `1px solid ${themeColor}33`, background: backgroundColor === "light" ? "#fafafa" : `linear-gradient(135deg, ${themeColor}0d, ${themeColor}06)` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: themeColor }}>カット（複数区間）</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="number" min={0} placeholder="開始秒" style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1px solid ${themeColor}33`, background: backgroundColor === "light" ? "#fff" : `linear-gradient(135deg, ${themeColor}12, ${themeColor}08)`, color: "inherit" }}
                  onBlur={(e) => setTrimStart(Math.max(0, Number(e.target.value) || 0))} />
                <input type="number" min={0} placeholder="終了秒" style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1px solid ${themeColor}33`, background: backgroundColor === "light" ? "#fff" : `linear-gradient(135deg, ${themeColor}12, ${themeColor}08)`, color: "inherit" }}
                  onBlur={(e) => setTrimEnd(Math.max(0, Number(e.target.value) || 0))} />
                <button
                  onClick={() => {
                    const s = Math.min(trimStart, trimEnd);
                    const e = Math.max(trimStart, trimEnd);
                    if (e > s) setSegments((prev) => [...prev, { start: s, end: e }]);
                  }}
                  style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${themeColor}66`, background: `linear-gradient(135deg, ${themeColor}4d, ${themeColor}33)`, color: "white", fontSize: 12, fontWeight: 700 }}
                >
                  区間を追加
                </button>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { if (videoRef.current) setTrimStart(Math.floor(videoRef.current.currentTime)); }} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${themeColor}40`, background: "transparent", color: themeColor }}>現在位置を開始に</button>
                <button onClick={() => { if (videoRef.current) setTrimEnd(Math.floor(videoRef.current.currentTime)); }} style={{ padding: "6px 10px", borderRadius: 8, border: `1px solid ${themeColor}40`, background: "transparent", color: themeColor }}>現在位置を終了に</button>
              </div>
              {segments.length > 0 && (
                <div style={{ display: "grid", gap: 6 }}>
                  {segments.map((seg, idx) => (
                    <div key={`${seg.start}-${seg.end}-${idx}`} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, opacity: 0.8 }}>区間 {idx + 1}: {seg.start}s - {seg.end}s</span>
                      <button onClick={() => setSegments((prev) => prev.filter((_, i) => i !== idx))} style={{ marginLeft: "auto", padding: "6px 10px", borderRadius: 8, border: `1px solid ${themeColor}40`, background: "transparent", color: themeColor }}>削除</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 12, borderRadius: 10, border: `1px solid ${themeColor}33`, background: backgroundColor === "light" ? "#fafafa" : `linear-gradient(135deg, ${themeColor}0d, ${themeColor}06)` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: themeColor }}>エフェクト（見た目）</div>
              <label style={{ fontSize: 12 }}>明るさ: {brightness}%</label>
              <input type="range" min={50} max={150} value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} />
              <label style={{ fontSize: 12 }}>コントラスト: {contrast}%</label>
              <input type="range" min={50} max={150} value={contrast} onChange={(e) => setContrast(Number(e.target.value))} />
              <label style={{ fontSize: 12 }}>彩度: {saturation}%</label>
              <input type="range" min={50} max={200} value={saturation} onChange={(e) => setSaturation(Number(e.target.value))} />
              <label style={{ fontSize: 12 }}>色相回転: {hue}°</label>
              <input type="range" min={-180} max={180} value={hue} onChange={(e) => setHue(Number(e.target.value))} />
              <label style={{ fontSize: 12 }}>ぼかし: {blur}px</label>
              <input type="range" min={0} max={6} value={blur} onChange={(e) => setBlur(Number(e.target.value))} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 12, borderRadius: 10, border: `1px solid ${themeColor}33`, background: backgroundColor === "light" ? "#fafafa" : `linear-gradient(135deg, ${themeColor}0d, ${themeColor}06)` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: themeColor }}>音楽（BGM）</div>
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                  <input type="radio" name="music-mode" checked={musicSourceMode === "file"} onChange={() => { setMusicSourceMode("file"); }} />
                  ファイル選択
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                  <input type="radio" name="music-mode" checked={musicSourceMode === "url"} onChange={() => { setMusicSourceMode("url"); }} />
                  URL指定
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                  <input type="radio" name="music-mode" checked={musicSourceMode === "none"} onChange={() => { setMusicSourceMode("none"); setMusicUrl(""); setMusicFile(null); }} />
                  なし
                </label>
              </div>
              {musicSourceMode === "file" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <input type="file" accept="audio/*" onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setMusicFile(f);
                    const url = f ? URL.createObjectURL(f) : "";
                    setMusicUrl(url);
                  }} />
                  {musicFile && (
                    <div style={{ fontSize: 12, opacity: 0.75 }}>✓ {musicFile.name}</div>
                  )}
                </div>
              )}
              {musicSourceMode === "url" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <input
                    type="url"
                    placeholder="https://...（権利に注意して利用してください）"
                    value={musicUrl}
                    onChange={(e) => { setMusicUrl(e.target.value); setMusicFile(null); }}
                    style={{ padding: "10px 12px", borderRadius: 10, border: `1px solid ${themeColor}33`, background: backgroundColor === "light" ? "#fff" : `linear-gradient(135deg, ${themeColor}12, ${themeColor}08)`, color: "inherit" }}
                  />
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12 }}>音量: {musicVolume}%</span>
                <input type="range" min={0} max={100} value={musicVolume} onChange={(e) => setMusicVolume(Number(e.target.value))} />
              </div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>
                音源の利用権に注意してください。URL指定の場合はクロスオリジン制限で再生できないことがあります。
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: 12, borderRadius: 10, border: `1px solid ${themeColor}33`, background: backgroundColor === "light" ? "#fafafa" : `linear-gradient(135deg, ${themeColor}0d, ${themeColor}06)` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: themeColor }}>効果音（SFX）</div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <select id="sfx-type" style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: `1px solid ${themeColor}33`, background: backgroundColor === "light" ? "#fff" : `linear-gradient(135deg, ${themeColor}12, ${themeColor}08)`, color: "inherit" }}>
                  <option value="beep">ビープ</option>
                  <option value="pop">ポップ</option>
                  <option value="whoosh">ウーシュ</option>
                </select>
                <input id="sfx-time" type="number" min={0} placeholder="秒" style={{ width: 90, padding: "8px 10px", borderRadius: 8, border: `1px solid ${themeColor}33`, background: backgroundColor === "light" ? "#fff" : `linear-gradient(135deg, ${themeColor}12, ${themeColor}08)`, color: "inherit" }} />
                <input id="sfx-vol" type="range" min={0} max={100} defaultValue={80} />
                <button
                  onClick={() => {
                    const typeSel = document.getElementById("sfx-type") as HTMLSelectElement | null;
                    const t = (typeSel?.value as "beep" | "pop" | "whoosh") || "beep";
                    const timeInp = document.getElementById("sfx-time") as HTMLInputElement | null;
                    const val = Math.max(0, Number(timeInp?.value) || 0);
                    const volInp = document.getElementById("sfx-vol") as HTMLInputElement | null;
                    const vol = Math.max(0, Math.min(100, Number(volInp?.value) || 80));
                    setSfxCues((prev) => [...prev, { time: val, type: t, volume: vol }]);
                  }}
                  style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${themeColor}66`, background: `linear-gradient(135deg, ${themeColor}4d, ${themeColor}33)`, color: "white", fontSize: 12, fontWeight: 700 }}
                >
                  追加
                </button>
              </div>
              {sfxCues.length > 0 && (
                <div style={{ display: "grid", gap: 6 }}>
                  {sfxCues.map((c, i) => (
                    <div key={`${c.type}-${c.time}-${i}`} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 12, opacity: 0.8 }}>{c.type} @ {c.time}s / vol {c.volume}%</span>
                      <button onClick={() => setSfxCues((prev) => prev.filter((_, idx) => idx !== i))} style={{ marginLeft: "auto", padding: "6px 10px", borderRadius: 8, border: `1px solid ${themeColor}40`, background: "transparent", color: themeColor }}>削除</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: 12,
              borderRadius: 10,
              border: `1px solid ${backgroundColor === "light" ? "rgba(255,100,150,.25)" : "rgba(255,120,180,.5)"}`,
              background: backgroundColor === "light" ? "rgba(255,120,180,.08)" : "rgba(255,120,180,.16)",
              color: backgroundColor === "light" ? "rgba(200,0,60,.9)" : "rgba(255,210,230,.9)",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}
      </div>

      <div style={{ padding: 16, borderTop: `1px solid ${backgroundColor === "light" ? "rgba(0,0,0,.1)" : themeColor}40`, background: backgroundColor === "light" ? "#ffffff" : "rgba(20,0,40,.6)", display: "grid", gap: 10 }}>
        <button
          onClick={savePost}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px 16px",
            borderRadius: 10,
            border: loading ? `1px solid ${themeColor}4d` : `1px solid ${themeColor}80`,
            background: loading ? `linear-gradient(135deg, ${themeColor}4d, ${themeColor}33)` : `linear-gradient(135deg, ${themeColor}bf, ${themeColor}a6)`,
            color: loading ? `${themeColor}90` : "white",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 16,
            fontWeight: 700,
            boxShadow: loading ? "none" : `0 0 24px ${themeColor}66, inset 0 1px 0 ${themeColor}40`,
          }}
        >
          {loading ? "投稿中..." : "編集内容で投稿する"}
        </button>
        <button
          onClick={() => router.push("/tabs/me/posts")}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 10,
            border: `1px solid ${themeColor}40`,
            background: "transparent",
            color: themeColor,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          キャンセルして戻る
        </button>
      </div>
    </div>
  );
}
