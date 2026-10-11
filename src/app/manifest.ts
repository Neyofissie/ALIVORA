import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Alivora",
    short_name: "Alivora",
    description: "Life, beautifully in sync.",
    start_url: "/home",
    display: "standalone",
    background_color: "#F5F1EB",
    theme_color: "#352C4F",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-maskable.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
