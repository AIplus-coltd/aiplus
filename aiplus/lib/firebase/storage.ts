import { storage } from "@/lib/firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadVideo(file: File, userId: string) {
  try {
    const ext = file.name.split(".").pop() || "mp4";
    const fileName = `${Date.now()}.${ext}`;
    const filePath = `videos/${userId}/${fileName}`;

    // Firebase Storage にアップロード
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, file, {
      customMetadata: {
        uploadedAt: new Date().toISOString(),
      },
    });

    // ダウンロードURLを取得
    const publicUrl = await getDownloadURL(storageRef);

    return {
      path: filePath,
      publicUrl,
    };
  } catch (error) {
    console.error("Firebase upload error:", error);
    throw error;
  }
}

export async function uploadThumbnail(dataUrl: string, userId: string) {
  try {
    const fileName = `${Date.now()}.jpg`;
    const filePath = `thumbnails/${userId}/${fileName}`;

    // Data URL をBlob に変換
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    // Firebase Storage にアップロード
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, blob, {
      contentType: "image/jpeg",
    });

    // ダウンロードURLを取得
    const publicUrl = await getDownloadURL(storageRef);

    return {
      path: filePath,
      publicUrl,
    };
  } catch (error) {
    console.error("Thumbnail upload error:", error);
    throw error;
  }
}
