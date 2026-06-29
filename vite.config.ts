import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { writeFileSync } from "fs";
import path from "path";
import { defineConfig, loadEnv, type Plugin } from "vite";

function adsTxtPlugin(clientId: string): Plugin {
  return {
    name: "ads-txt",
    closeBundle() {
      const pubId = clientId.replace(/^ca-/, "");
      if (!pubId || pubId.includes("x")) return;
      const line = `google.com, ${pubId}, DIRECT, f08c47fec0942fa0\n`;
      writeFileSync(path.resolve("dist", "ads.txt"), line, "utf8");
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const adsenseClient = env.VITE_ADSENSE_CLIENT_ID ?? "";

  return {
    plugins: [react(), tailwindcss(), adsTxtPlugin(adsenseClient)],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    build: {
      target: "es2020",
      cssMinify: true,
      minify: "esbuild",
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/lucide-react")) return "icons";
            if (id.includes("node_modules/fflate")) return "codec";
            if (id.includes("node_modules/react-dom")) return "react-dom";
            if (id.includes("node_modules/react/")) return "react";
          },
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== "true",
      watch: process.env.DISABLE_HMR === "true" ? null : {},
    },
  };
});
