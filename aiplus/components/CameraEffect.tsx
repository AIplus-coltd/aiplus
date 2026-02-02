import React, { useRef, useEffect } from "react";
// Three.js
import * as THREE from "three";
// MediaPipe FaceMesh
// 必要に応じてnpm install @mediapipe/face_mesh @mediapipe/camera_utils @mediapipe/drawing_utils
// import { FaceMesh } from "@mediapipe/face_mesh"; // ←NG
const FaceMesh = typeof window !== "undefined" ? (window as any).FaceMesh : undefined;
// Cameraは@mediapipe/camera_utilsでグローバル登録される
// import { Camera } from "@mediapipe/camera_utils"; // ←NG
const Camera = typeof window !== "undefined" ? (window as any).Camera : undefined;

const CameraEffect: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threeCanvasRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);

  useEffect(() => {
    let animationId: number;
    let cameraUtils: any;
    let faceMesh: any;
    let video: HTMLVideoElement | null = videoRef.current;
    let canvas: HTMLCanvasElement | null = canvasRef.current;

    // Three.js初期化
    if (threeCanvasRef.current && !rendererRef.current) {
      const width = 640, height = 480;
      const renderer = new THREE.WebGLRenderer({ alpha: true });
      renderer.setSize(width, height);
      threeCanvasRef.current.appendChild(renderer.domElement);
      rendererRef.current = renderer;
      const scene = new THREE.Scene();
      sceneRef.current = scene;
      const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
      camera.position.z = 2;
      cameraRef.current = camera;
      // パーティクル初期化
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(468 * 3); // FaceMeshランドマーク数
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const material = new THREE.PointsMaterial({ color: 0x00ffff, size: 0.02 });
      const particles = new THREE.Points(geometry, material);
      scene.add(particles);
      particlesRef.current = particles;
    }

    // MediaPipe FaceMesh初期化
    faceMesh = new FaceMesh({
      locateFile: (file: any) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });
    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    faceMesh.onResults((results: any) => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current || !particlesRef.current) return;
      // GPUフィルター例: ここでcanvasにWebGLフィルターを適用可能
      // パーティクル座標更新
      if (results.multiFaceLandmarks && results.multiFaceLandmarks[0]) {
        const lm = results.multiFaceLandmarks[0];
        const positions = particlesRef.current.geometry.attributes.position.array;
        for (let i = 0; i < lm.length; i++) {
          positions[i * 3] = (lm[i].x - 0.5) * 2; // -1〜1
          positions[i * 3 + 1] = -(lm[i].y - 0.5) * 2;
          positions[i * 3 + 2] = lm[i].z * 2;
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    });

    // カメラ起動
    if (video) {
      cameraUtils = new Camera(video, {
        onFrame: async () => {
          await faceMesh.send({ image: video });
        },
        width: 640,
        height: 480,
      });
      cameraUtils.start();
    }

    // クリーンアップ
    return () => {
      if (cameraUtils) cameraUtils.stop();
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      if (threeCanvasRef.current) {
        threeCanvasRef.current.innerHTML = "";
      }
    };
  }, []);

  return (
    <div style={{ position: "relative", width: 640, height: 480 }}>
      <video ref={videoRef} style={{ display: "none" }} playsInline />
      <canvas ref={canvasRef} width={640} height={480} style={{ display: "none" }} />
      <div ref={threeCanvasRef} style={{ position: "absolute", top: 0, left: 0 }} />
    </div>
  );
};

export default CameraEffect;
