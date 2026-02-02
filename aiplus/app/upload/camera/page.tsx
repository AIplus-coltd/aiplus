"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type FilterType = "none" | "beautify" | "monochrome";

export default function CameraPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animationRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isAnimatingRef = useRef<boolean>(false);
  const zoomLevelRef = useRef(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string>("");
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");
  const [themeColor, setThemeColor] = useState<string>("#ff1493");
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentFilter, setCurrentFilter] = useState<FilterType>("none");
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem("appSettings");
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    const color = settings.themeColor || "pink";
    const themeMap: Record<string, string> = {
      pink: "#ff1493",
      blue: "#64b5f6",
      green: "#81c784",
      purple: "#9d4edd",
    };
    setThemeColor(themeMap[color] || "#ff1493");
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode },
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error("カメラアクセスエラー:", err);
      alert("カメラにアクセスできませんでした");
    }
  };

  const stopCamera = () => {
    isAnimatingRef.current = false;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
    setCameraActive(false);
  };

  const toggleCamera = () => {
    stopCamera();
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    setTimeout(() => startCamera(), 100);
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    
    const mediaRecorder = new MediaRecorder(streamRef.current, {
      mimeType: "video/webm;codecs=vp9",
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      setRecordedVideoUrl(url);
      stopCamera();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setRecordingTime(0);
    };

    chunksRef.current = [];
    mediaRecorder.start();
    mediaRecorderRef.current = mediaRecorder;
    setIsRecording(true);
    
    setRecordingTime(0);
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const goToCut = async () => {
    console.log("goToCut called, recordedVideoUrl:", !!recordedVideoUrl);
    
    if (!recordedVideoUrl) {
      alert("動画を撮影してください");
      return;
    }
    
    try {
      const session = {
        videoUrl: recordedVideoUrl,
        thumbnailDataUrl: recordedVideoUrl,
      };
      console.log("Saving session to localStorage...");
      localStorage.setItem("editorSession", JSON.stringify(session));
      localStorage.setItem("metaPageReferrer", "/upload/camera");
      console.log("✓ Session saved, navigating to /upload/meta");
      
      // ルーター遷移
      await router.push("/upload/meta");
      console.log("✓ Navigation completed");
    } catch (err) {
      console.error("Error in goToCut:", err);
      alert("エラーが発生しました");
    }
  };

  const goToCutLive = () => {
    // ライブのカメラストリームをカット編集へ渡す（スナップショット取得）
    if (!videoRef.current) return;
    
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const snapshotUrl = canvas.toDataURL("image/jpeg");
      
      const cutConfig = {
        videoUrl: snapshotUrl,
        segments: [],
        applySegmentsPreview: false,
      };
      localStorage.setItem("editorCutConfig", JSON.stringify(cutConfig));
      localStorage.setItem("cutPageReferrer", "/upload/camera");
      router.push("/upload/cut");
    }
  };

  const saveVideo = () => {
    if (!recordedVideoUrl) return;
    
    let userId: string | null = null;
    const currentUserRaw = sessionStorage.getItem("currentUser") || localStorage.getItem("currentUser");
    if (currentUserRaw) {
      try {
        const parsed = JSON.parse(currentUserRaw);
        userId = parsed?.id || parsed?.user_id || null;
      } catch {}
    }
    if (!userId) {
      userId = localStorage.getItem("me");
    }
    if (!userId) {
      userId = "demo-user";
      localStorage.setItem("me", userId);
    }

    const videoData = {
      id: `video-${Date.now()}`,
      user_id: userId,
      title: `録画 ${new Date().toLocaleString()}`,
      video_url: recordedVideoUrl,
      created_at: new Date().toISOString(),
    };

    const existingVideos = localStorage.getItem(`videos_${userId}`);
    const videos = existingVideos ? JSON.parse(existingVideos) : [];
    videos.push(videoData);
    localStorage.setItem(`videos_${userId}`, JSON.stringify(videos));

    const existingFeed = localStorage.getItem("mockVideos");
    const feedVideos = existingFeed ? JSON.parse(existingFeed) : [];
    feedVideos.unshift(videoData);
    localStorage.setItem("mockVideos", JSON.stringify(feedVideos));

    alert("動画を保存しました！");
    router.push("/tabs/me/view");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith("video/");
    if (!isVideo) {
      alert("動画ファイルを選択してください");
      return;
    }

    const url = URL.createObjectURL(file);
    setRecordedVideoUrl(url);
    stopCamera();
    console.log("✓ Video file selected:", file.name);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const retake = () => {
    setRecordedVideoUrl("");
    startCamera();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const zoomIn = () => {
    zoomLevelRef.current = Math.min(zoomLevelRef.current + 0.5, 3);
  };

  const zoomOut = () => {
    zoomLevelRef.current = Math.max(zoomLevelRef.current - 0.5, 1);
  };

  const detectAndDrawFilter = useCallback(async () => {
    if (!isAnimatingRef.current) return;
    
    if (!videoRef.current || !canvasRef.current || currentFilter === "none") {
      animationRef.current = requestAnimationFrame(detectAndDrawFilter);
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      
      if (currentFilter === "beautify") {
        ctx.filter = "brightness(1.08) contrast(1.05) saturate(1.1)";
      } else if (currentFilter === "monochrome") {
        ctx.filter = "grayscale(1)";
      } else {
        ctx.filter = "none";
      }
      
      const currentZoom = zoomLevelRef.current;
      const sourceWidth = video.videoWidth / currentZoom;
      const sourceHeight = video.videoHeight / currentZoom;
      const sourceX = (video.videoWidth - sourceWidth) / 2;
      const sourceY = (video.videoHeight - sourceHeight) / 2;
      
      ctx.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, video.videoWidth, video.videoHeight);
      ctx.filter = "none";
    } catch (err) {
      console.error("フィルター適用エラー:", err);
    }

    if (isAnimatingRef.current) {
      animationRef.current = requestAnimationFrame(detectAndDrawFilter);
    }
  }, [currentFilter]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      isAnimatingRef.current = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const stopAnimation = () => {
      isAnimatingRef.current = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
    };

    stopAnimation();

    if (currentFilter !== "none" && cameraActive) {
      isAnimatingRef.current = true;
      detectAndDrawFilter();
    }

    return () => {
      stopAnimation();
    };
  }, [currentFilter, cameraActive, detectAndDrawFilter]);

  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(0,0,0,0.7)",
          backdropFilter: "blur(10px)",
          gap: 12,
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.3)",
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          ← 戻る
        </button>
        <button
          onClick={openFileDialog}
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.3)",
            color: "#fff",
            fontSize: 18,
            cursor: "pointer",
          }}
          title="既存の動画を選択"
        >
          📁
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => {
            console.log("Button clicked! recordedVideoUrl:", !!recordedVideoUrl);
            goToCut();
          }}
          style={{
            padding: "10px 18px",
            borderRadius: 8,
            background: recordedVideoUrl ? "#fff" : "rgba(200,200,200,0.3)",
            border: recordedVideoUrl ? "2px solid #fff" : "2px solid #999",
            color: recordedVideoUrl ? "#000" : "#999",
            cursor: recordedVideoUrl ? "pointer" : "not-allowed",
            fontSize: 16,
            fontWeight: 700,
            boxShadow: recordedVideoUrl ? "0 4px 12px rgba(255,255,255,0.6)" : "none",
            opacity: recordedVideoUrl ? 1 : 0.6,
          }}
        >
          次へ →
        </button>
      </div>

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        {!recordedVideoUrl ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: currentFilter === "none" ? "block" : "none",
                transform: `scale(${zoomLevelRef.current})`,
              }}
            />
            {isRecording && (
              <div
                style={{
                  position: "absolute",
                  top: 20,
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(255,0,0,0.8)",
                  padding: "8px 16px",
                  borderRadius: 20,
                  fontSize: 18,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: "#fff",
                    animation: "pulse 1s infinite",
                  }}
                />
                {formatTime(recordingTime)}
              </div>
            )}
            <div
              style={{
                position: "absolute",
                right: 14,
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                alignItems: "center",
                zIndex: 20,
              }}
            >
              {cameraActive && !recordedVideoUrl && (
                <button
                  onClick={toggleCamera}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    border: "none",
                    background: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(10px)",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                  }}
                  title="カメラ切替"
                >
                  🔄
                </button>
              )}
              <button
                onClick={() => setShowFilterMenu(!showFilterMenu)}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  border: "none",
                  background: currentFilter !== "none" ? `${themeColor}cc` : "rgba(0,0,0,0.6)",
                  backdropFilter: "blur(10px)",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: currentFilter !== "none" ? `0 0 20px ${themeColor}` : "0 4px 12px rgba(0,0,0,0.3)",
                }}
                title="エフェクト"
              >
                ✨
              </button>
              <button
                onClick={zoomOut}
                disabled={zoomLevelRef.current <= 1}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(0,0,0,0.6)",
                  backdropFilter: "blur(10px)",
                  color: zoomLevelRef.current <= 1 ? "#666" : "#fff",
                  cursor: zoomLevelRef.current <= 1 ? "not-allowed" : "pointer",
                  fontSize: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                }}
                title="ズームアウト"
              >
                🔍➖
              </button>
              <button
                onClick={zoomIn}
                disabled={zoomLevelRef.current >= 3}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(0,0,0,0.6)",
                  backdropFilter: "blur(10px)",
                  color: zoomLevelRef.current >= 3 ? "#666" : "#fff",
                  cursor: zoomLevelRef.current >= 3 ? "not-allowed" : "pointer",
                  fontSize: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                }}
                title="ズームイン"
              >
                🔍➕
              </button>
              {cameraActive && !recordedVideoUrl && (
                <button
                  onClick={() => {
                    setShowFilterMenu(false);
                    goToCutLive();
                  }}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    border: "none",
                    background: "rgba(255,105,180,0.3)",
                    backdropFilter: "blur(10px)",
                    color: "#ff69b4",
                    cursor: "pointer",
                    fontSize: 24,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 0 12px rgba(255,105,180,0.6)",
                  }}
                  title="カット編集"
                >
                  ✂️
                </button>
              )}
            </div>
            
            {showFilterMenu && (
              <div
                style={{
                  position: "absolute",
                  bottom: 100,
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex",
                  gap: 12,
                  padding: "12px 16px",
                  background: "rgba(0,0,0,0.8)",
                  backdropFilter: "blur(10px)",
                  borderRadius: 16,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                  zIndex: 30,
                }}
              >
                {[
                  { type: "none" as FilterType, emoji: "🚫", label: "なし" },
                  { type: "beautify" as FilterType, emoji: "✨", label: "美肌" },
                  { type: "monochrome" as FilterType, emoji: "🎨", label: "モノクロ" },
                ].map((filter) => (
                  <button
                    key={filter.type}
                    onClick={() => {
                      setCurrentFilter(filter.type);
                      setShowFilterMenu(false);
                    }}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: "50%",
                      border: currentFilter === filter.type ? `2px solid ${themeColor}` : "2px solid transparent",
                      background: currentFilter === filter.type ? `${themeColor}40` : "rgba(255,255,255,0.1)",
                      color: "#fff",
                      cursor: "pointer",
                      fontSize: 24,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: currentFilter === filter.type ? `0 0 16px ${themeColor}` : "none",
                    }}
                    title={filter.label}
                  >
                    {filter.emoji}
                  </button>
                ))}
              </div>
            )}
            
            {currentFilter !== "none" && (
              <canvas
                ref={canvasRef}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  pointerEvents: "none",
                }}
              />
            )}
          </>
        ) : (
          <video
            src={recordedVideoUrl}
            controls
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        )}
      </div>

      <div
        style={{
          padding: "20px 16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          background: "rgba(0,0,0,0.9)",
        }}
      >
        {!recordedVideoUrl ? (
          <>
            {!isRecording ? (
              <button
                onClick={startRecording}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #00d4ff 0%, #0088cc 100%)",
                  border: "4px solid #fff",
                  cursor: "pointer",
                  fontSize: 24,
                  boxShadow: "0 6px 24px rgba(0,212,255,0.6)",
                }}
              >
                ⬤
              </button>
            ) : (
              <button
                onClick={stopRecording}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 12,
                  background: "#fff",
                  border: "4px solid #f00",
                  cursor: "pointer",
                  fontSize: 24,
                }}
              >
                ■
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={retake}
              style={{
                padding: "12px 24px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.2)",
                border: "1px solid #fff",
                color: "#fff",
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              撮り直し
            </button>
            <button
              onClick={() => {
                console.log("Bottom button clicked! recordedVideoUrl:", !!recordedVideoUrl);
                goToCut();
              }}
              style={{
                padding: "12px 32px",
                borderRadius: 8,
                background: "#fff",
                border: "none",
                color: "#000",
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 700,
                boxShadow: "0 4px 16px rgba(255,255,255,0.6)",
              }}
            >
              次へ
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      {/* 隠しのファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />
    </div>
  );
}
