import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Oud Atelier — Dubai",
    short_name: "Oud Atelier",
    description: "Rare oud, attars and fine fragrance, composed in Dubai.",
    start_url: "/en",
    display: "standalone",
    background_color: "#f7f3ec",
    theme_color: "#0e0d0b",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
