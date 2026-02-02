"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const SESSION_KEY = "editorSession";
const THUMB_KEY = "thumbData";
const CUT_CONFIG_KEY = "editorCutConfig";

export default function ThumbnailEditPage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);

  const [themeColor, setThemeColor] = useState<string>("#2b7ba8");
  const [backgroundColor, setBackgroundColor] = useState<"light">("light");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [scale, setScale] = useState<number>(1);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);

  // Text and background
  const [text, setText] = useState<string>("");
  const [textSize, setTextSize] = useState<number>(32);
  const [textColor, setTextColor] = useState<string>("#ffffff");
  const [textX, setTextX] = useState<number>(0);
  const [textY, setTextY] = useState<number>(0);
  const [bgImageUrl, setBgImageUrl] = useState<string>("");
  const [useVideoFrame, setUseVideoFrame] = useState<boolean>(true);
  const [isDraggingText, setIsDraggingText] = useState<boolean>(false);
  const [showColorPresets, setShowColorPresets] = useState<boolean>(false);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const textXRef = useRef<number>(0);
  const textYRef = useRef<number>(0);
  const textSizeRef = useRef<number>(32);

  // Load theme and session
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

    const saved = localStorage.getItem(SESSION_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const sessionVideoUrl = parsed.videoUrl;
        
        // CUT_CONFIG_KEY からも確認
        const cutConfig = localStorage.getItem(CUT_CONFIG_KEY);
        const cutVideoUrl = cutConfig ? JSON.parse(cutConfig).videoUrl : null;
        
        const effectiveVideoUrl = sessionVideoUrl || cutVideoUrl;
        if (effectiveVideoUrl) {
          setVideoUrl(effectiveVideoUrl);
          if (parsed.coverTime !== undefined) setCurrentTime(parsed.coverTime);
        }
      } catch {}
    }

    const savedThumb = localStorage.getItem(THUMB_KEY);
    if (savedThumb) {
      try {
        const parsed = JSON.parse(savedThumb);
        if (parsed.scale !== undefined) setScale(parsed.scale);
        if (parsed.offsetX !== undefined) setOffsetX(parsed.offsetX);
        if (parsed.offsetY !== undefined) setOffsetY(parsed.offsetY);
        if (parsed.brightness !== undefined) setBrightness(parsed.brightness);
        if (parsed.contrast !== undefined) setContrast(parsed.contrast);
        if (parsed.currentTime !== undefined) setCurrentTime(parsed.currentTime);
        // 過去のチE��スト�E初期表示では復允E��なぁE
        setText("");
        if (parsed.textSize !== undefined) setTextSize(parsed.textSize);
        if (parsed.textColor !== undefined) setTextColor(parsed.textColor);
        if (parsed.textX !== undefined) setTextX(parsed.textX);
        if (parsed.textY !== undefined) setTextY(parsed.textY);
        if (parsed.bgImageUrl !== undefined) {
          setBgImageUrl(parsed.bgImageUrl);
          // 保存された画像を読み込む
          const img = new Image();
          img.onload = () => {
            bgImageRef.current = img;
          };
          img.src = parsed.bgImageUrl;
        }
        if (parsed.useVideoFrame !== undefined) setUseVideoFrame(parsed.useVideoFrame);
      } catch {}
    }
  }, []);

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration || 0);
      videoRef.current.currentTime = currentTime;
      drawThumbnail();
    }
  };

  const handleVideoSeeked = () => {
    // ビデオシーク完了後に描画を確実に実行
    drawThumbnail();
  };

  const drawThumbnail = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const w = canvasRef.current.width;
    const h = canvasRef.current.height;

    // Clear
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);

    // Draw background - either video frame or image
    if (useVideoFrame && videoRef.current) {
      ctx.save();
      ctx.globalAlpha = 1;
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`;
      const vw = videoRef.current.videoWidth || w;
      const vh = videoRef.current.videoHeight || h;
      
      // アスペクト比を保持して描画
      const videoRatio = vw / vh;
      const canvasRatio = w / h;
      
      let drawW = w;
      let drawH = h;
      let drawX = 0;
      let drawY = 0;
      
      if (videoRatio > canvasRatio) {
        // 動画の方が横長 ↁE幁E��合わせる
        drawH = w / videoRatio;
        drawY = (h - drawH) / 2;
      } else {
        // 動画の方が縦長 ↁE高さに合わせる
        drawW = h * videoRatio;
        drawX = (w - drawW) / 2;
      }
      
      ctx.drawImage(videoRef.current, drawX, drawY, drawW, drawH);
      ctx.restore();
    } else if (bgImageUrl && bgImageRef.current) {
      // アスペクト比を保持して描画
      const img = bgImageRef.current;
      const imgRatio = img.width / img.height;
      const canvasRatio = w / h;
      
      let drawW = w;
      let drawH = h;
      let drawX = 0;
      let drawY = 0;
      
      if (imgRatio > canvasRatio) {
        // 画像�E方が横長 ↁE幁E��合わせる
        drawH = w / imgRatio;
        drawY = (h - drawH) / 2;
      } else {
        // 画像�E方が縦長 ↁE高さに合わせる
        drawW = h * imgRatio;
        drawX = (w - drawW) / 2;
      }
      
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }

    drawText(ctx, w, h);
  };

  const drawText = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    if (!text) return;
    
    ctx.font = `bold ${textSize}px sans-serif`;
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // チE��スト�Eアウトライン�E�見やすくするため�E�E
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 3;
    ctx.strokeText(text, w / 2 + textX, h / 2 + textY);
    
    ctx.fillText(text, w / 2 + textX, h / 2 + textY);
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    
    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const isNearText = (x: number, y: number) => {
    if (!canvasRef.current || !text) return false;
    const textCenterX = canvasRef.current.width / 2 + textX;
    const textCenterY = canvasRef.current.height / 2 + textY;
    const distance = Math.sqrt(Math.pow(x - textCenterX, 2) + Math.pow(y - textCenterY, 2));
    // チE��ストサイズの3倍までタチE��篁E��を庁E��めE
    return distance < textSize * 3;
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e);
    if (isNearText(coords.x, coords.y)) {
      setIsDraggingText(true);
      dragOffsetRef.current = {
        x: coords.x - (canvasRef.current!.width / 2 + textX),
        y: coords.y - (canvasRef.current!.height / 2 + textY),
      };
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingText) return;
    const coords = getCanvasCoords(e);
    const newTextX = coords.x - canvasRef.current!.width / 2 - dragOffsetRef.current.x;
    const newTextY = coords.y - canvasRef.current!.height / 2 - dragOffsetRef.current.y;
    setTextX(Math.round(newTextX));
    setTextY(Math.round(newTextY));
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingText(false);
  };

  // refを更新
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    textXRef.current = textX;
    textYRef.current = textY;
    textSizeRef.current = textSize;
  }, [textX, textY, textSize]);

  // タチE��イベント�EuseEffectでネイチE��ブリスナ�Eとして登録
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.touches[0].clientX - rect.left) * scaleX;
      const y = (e.touches[0].clientY - rect.top) * scaleY;

      // refから現在のチE��スト位置を取征E
      const currentTextX = textXRef.current;
      const currentTextY = textYRef.current;
      const currentTextSize = textSizeRef.current;
      const centerX = canvas.width / 2 + currentTextX;
      const centerY = canvas.height / 2 + currentTextY;
      const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);

      if (distance < currentTextSize * 3) {
        isDragging = true;
        dragOffset = {
          x: x - centerX,
          y: y - centerY,
        };
        setIsDraggingText(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const x = (e.touches[0].clientX - rect.left) * scaleX;
      const y = (e.touches[0].clientY - rect.top) * scaleY;

      const newTextX = x - canvas.width / 2 - dragOffset.x;
      const newTextY = y - canvas.height / 2 - dragOffset.y;
      setTextX(Math.round(newTextX));
      setTextY(Math.round(newTextY));
    };

    const handleTouchEnd = () => {
      isDragging = false;
      setIsDraggingText(false);
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const handleBgImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setBgImageUrl(result);
      setUseVideoFrame(false);
      
      // 画像を事前に読み込む
      const img = new Image();
      img.onload = () => {
        bgImageRef.current = img;
        drawThumbnail();
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setVideoUrl(result);
      setUseVideoFrame(true);
      
      // ビデオを読み込む
      if (videoRef.current) {
        videoRef.current.src = result;
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
     const timer = setTimeout(() => drawThumbnail(), 200);
    return () => clearTimeout(timer);
  }, [scale, offsetX, offsetY, brightness, contrast, videoUrl, currentTime, text, textSize, textColor, textX, textY, bgImageUrl, useVideoFrame]);

  const saveThumbnail = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/jpeg", 0.9);
    console.log("saveThumbnail: generating thumbnail", {
      hasCanvas: !!canvasRef.current,
      dataUrlLength: dataUrl.length,
      hasVideoUrl: !!videoUrl
    });
    try {
      const existingSession = JSON.parse(localStorage.getItem(SESSION_KEY) || "{}");
      
      // thumbnailDataUrlのみをSESSION_KEYに保孁EvideoUrlは容量が大きいので除夁E
      const newSession = {
        ...existingSession,
        thumbnailDataUrl: dataUrl,
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
      console.log("saveThumbnail: saved thumbnail to SESSION_KEY", {
        thumbnailLength: dataUrl.length
      });

      // videoUrlは新規アチE�EロードがあればCUT_CONFIG_KEYを更新(既存�EvideoUrlはそ�Eまま使ぁE
      if (videoUrl) {
        try {
          const cutConfig = localStorage.getItem(CUT_CONFIG_KEY);
          const existingCutConfig = cutConfig ? JSON.parse(cutConfig) : {};
          localStorage.setItem(CUT_CONFIG_KEY, JSON.stringify({
            ...existingCutConfig,
            videoUrl: videoUrl
          }));
          console.log("saveThumbnail: updated videoUrl in CUT_CONFIG_KEY");
        } catch (e) {
          console.error("saveThumbnail: failed to update CUT_CONFIG_KEY", e);
        }
      }

      localStorage.setItem(
        THUMB_KEY,
        JSON.stringify({
          scale,
          offsetX,
          offsetY,
          brightness,
          contrast,
          currentTime,
          text,
          textSize,
          textColor,
          textX,
          textY,
          bgImageUrl,
          useVideoFrame,
        })
      );
    } catch (e) {
      console.error("saveThumbnail: save failed", e);
    }
    // localStorageの書き込みが完亁E��るまで少し征E��E
    setTimeout(() => {
      router.push("/upload/meta");
    }, 100);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "#fefefe",
        color: "#111",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: `1px solid ${themeColor}40`,
          background: "linear-gradient(180deg, rgba(245,245,245,.95) 0%, rgba(240,240,240,.93) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button onClick={() => router.back()} style={{ background: "transparent", border: "none", color: themeColor, fontSize: 18, cursor: "pointer" }}>←</button>
        <div style={{ fontWeight: 700, color: themeColor }}>サムネイル編集</div>
        <div style={{ width: 24 }} />
      </div>

      <div style={{ flex: 1, padding: 8, display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Canvas preview */}
        <div style={{ flex: 1, borderRadius: 12, border: `1px solid ${themeColor}33`, background: "rgba(0,0,0,0.5)", padding: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <canvas
            ref={canvasRef}
            width={640}
            height={360}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            style={{ borderRadius: 8, border: `1px solid ${themeColor}40`, width: "100%", height: "100%", cursor: isDraggingText ? "grabbing" : "grab", touchAction: "none" }}
          />
        </div>

        {/* Background selection */}
        <div style={{ borderRadius: 8, border: `1px solid ${themeColor}33`, background: `linear-gradient(135deg, ${themeColor}0d, ${themeColor}06)`, padding: 8, display: "grid", gap: 4 }}>
          <label style={{ fontWeight: 700, color: themeColor, fontSize: 12 }}>背景選択</label>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => videoInputRef.current?.click()}
              style={{
                flex: 1,
                padding: "6px 10px",
                borderRadius: 6,
                border: `1px solid ${themeColor}${useVideoFrame && videoUrl ? "bf" : "40"}`,
                background: useVideoFrame && videoUrl ? `${themeColor}40` : "transparent",
                color: themeColor,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 11,
              }}
            >
              ビデオ選択
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                flex: 1,
                padding: "6px 10px",
                borderRadius: 6,
                border: `1px solid ${themeColor}${!useVideoFrame && bgImageUrl ? "bf" : "40"}`,
                background: !useVideoFrame && bgImageUrl ? `${themeColor}40` : "transparent",
                color: themeColor,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 11,
              }}
            >
              画像選択
            </button>
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoSelect}
              style={{ display: "none" }}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleBgImageSelect}
              style={{ display: "none" }}
            />
          </div>

          {useVideoFrame && (
            <>
              <video
                ref={videoRef}
                src={videoUrl || undefined}
                onLoadedMetadata={handleLoadedMetadata}
                style={{ borderRadius: 6, border: `1px solid ${themeColor}40`, width: "100%", height: "auto", aspectRatio: "16/9" }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input
                  type="range"
                  min={0}
                  max={duration}
                  value={currentTime}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setCurrentTime(val);
                      if (videoRef.current) {
                        videoRef.current.currentTime = val;
                        // 遅延後に描画を再実行してシンク確保
                        setTimeout(() => drawThumbnail(), 50);
                      }
                  }}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: 12, minWidth: 60 }}>{currentTime.toFixed(1)}s</span>
              </div>
            </>
          )}
        </div>

        {/* Text section */}
        <div style={{ borderRadius: 8, border: `1px solid ${themeColor}33`, background: `linear-gradient(135deg, ${themeColor}0d, ${themeColor}06)`, padding: 8, display: "grid", gap: 4 }}>
          <label style={{ fontWeight: 700, color: themeColor, fontSize: 12, display: "block" }}>文字を追加</label>

          <div style={{ display: "grid", gap: 6 }}>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="文字を入力..."
              style={{
                padding: "6px 10px",
                borderRadius: 6,
                border: `1px solid ${themeColor}40`,
                background: "transparent",
                color: "inherit",
                fontSize: 13,
              }}
            />

            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <label style={{ fontSize: 10, opacity: 0.85, minWidth: 45 }}>サイズ:</label>
              <input
                type="range"
                min={16}
                max={80}
                value={textSize}
                onChange={(e) => setTextSize(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ fontSize: 10, minWidth: 25 }}>{textSize}</span>
            </div>

            <button
              onClick={() => setShowColorPresets(!showColorPresets)}
              style={{
                padding: "4px 8px",
                borderRadius: 4,
                border: `1px solid ${themeColor}40`,
                background: showColorPresets ? `${themeColor}40` : "transparent",
                color: themeColor,
                cursor: "pointer",
                fontSize: 10,
                fontWeight: 600,
              }}
            >
              色パレット {showColorPresets ? "▼" : "▶"}
            </button>

            {showColorPresets && (
              <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                {[
                  { label: "赤", color: "#FF0000" },
                  { label: "青", color: "#0000FF" },
                  { label: "緑", color: "#00AA00" },
                  { label: "水色", color: "#00FFFF" },
                  { label: "ピンク", color: "#3c8ec4" },
                  { label: "白", color: "#FFFFFF" },
                  { label: "茶色", color: "#8B4513" },
                  { label: "オレンジ", color: "#FFA500" },
                  { label: "黄色", color: "#FFFF00" },
                  { label: "紫", color: "#800080" },
                ].map((preset) => (
                  <button
                    key={preset.color}
                    onClick={() => setTextColor(preset.color)}
                    style={{
                      padding: "4px 8px",
                      borderRadius: 4,
                      border: textColor === preset.color ? `2px solid ${preset.color}` : `1px solid ${themeColor}40`,
                      background: preset.color,
                      cursor: "pointer",
                      fontSize: 9,
                      color: preset.color === "#FFFF00" || preset.color === "#00FFFF" ? "#000" : "#fff",
                      fontWeight: 600,
                      flex: "0 0 calc(50% - 2px)",
                    }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: "8px 12px", borderTop: `1px solid ${themeColor}40`, background: "#ffffff", display: "flex", gap: 8, justifyContent: "space-between" }}>
        <button
          onClick={() => router.back()}
          style={{
            padding: "6px 16px",
            borderRadius: 8,
            border: `1px solid ${themeColor}40`,
            background: "transparent",
            color: themeColor,
            fontWeight: 600,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          戻る
        </button>
        <button
          onClick={saveThumbnail}
          style={{
            padding: "6px 20px",
            borderRadius: 8,
            border: `1px solid ${themeColor}80`,
            background: `linear-gradient(135deg, ${themeColor}bf, ${themeColor}a6)`,
            color: "white",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            boxShadow: `0 0 16px ${themeColor}66`,
          }}
        >
          確定
        </button>
      </div>
    </div>
  );
}

