import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AI+",
    short_name: "AI+",
    start_url: "/tabs/feed",
    display: "standalone",
    background_color: "#0a0014",
    theme_color: "#ff1493",
  };
}