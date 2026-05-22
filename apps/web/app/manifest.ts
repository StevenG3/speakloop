import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SpeakLoop",
    short_name: "SpeakLoop",
    description: "AI speaking practice with offline mock providers.",
    start_url: "/app",
    scope: "/",
    display: "standalone",
    background_color: "#fffaf6",
    theme_color: "#d9572b",
    icons: [
      { src: "icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { src: "icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" }
    ]
  };
}
