import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const directusTarget =
    env.VITE_DIRECTUS_PROXY_TARGET ?? "https://crm.alexandra-anthopoulou.cloud";

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/directus": {
          target: directusTarget,
          changeOrigin: true,
          secure: true,
          rewrite: (p) => p.replace(/^\/directus/, ""),
        },
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            "vendor-react": ["react", "react-dom", "react-router"],
            "vendor-refine": [
              "@refinedev/core",
              "@refinedev/react-router",
              "@refinedev/kbar",
              "@refinedev/devtools",
              "@tanstack/react-query",
            ],
            "vendor-directus": ["@directus/sdk", "@tspvivek/refine-directus"],
            "vendor-dnd": ["@dnd-kit/core", "@dnd-kit/sortable", "@dnd-kit/utilities"],
            "vendor-ui": ["framer-motion", "lucide-react", "sonner"],
          },
        },
      },
    },
  };
});
