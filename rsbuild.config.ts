import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";

export default defineConfig({
  plugins: [pluginReact()],
  resolve: {
    alias: {
      "@app": "./src/app",
      "@pages": "./src/pages",
      "@domain": "./src/domain",
      "@data": "./src/data",
      "@components": "./src/components",
      "@hooks": "./src/hooks",
      "@shared": "./src/shared",
      "@config": "./src/config",
      "@assets": "./src/assets",
    },
  },
  source: {
    entry: {
      index: "./src/main.tsx",
    },
    define: {
      "process.env.REACT_APP_WOMPI_PUBLIC_KEY": JSON.stringify(
        process.env.REACT_APP_WOMPI_PUBLIC_KEY ?? "",
      ),
      "process.env.REACT_APP_WOMPI_INTEGRITY_SECRET": JSON.stringify(
        process.env.REACT_APP_WOMPI_INTEGRITY_SECRET ?? "",
      ),
      "process.env.REACT_APP_ORDER_WEBHOOK_URL": JSON.stringify(
        process.env.REACT_APP_ORDER_WEBHOOK_URL ?? "",
      ),
      "process.env.REACT_APP_SUPABASE_URL": JSON.stringify(
        process.env.REACT_APP_SUPABASE_URL ?? "",
      ),
      "process.env.REACT_APP_SUPABASE_ANON_KEY": JSON.stringify(
        process.env.REACT_APP_SUPABASE_ANON_KEY ?? "",
      ),
    },
  },
  html: {
    template: "./index.html",
    title: "BEIRUT · Minimarket libanés en Colombia",
    favicon: "./public/favicon.ico",
  },
  server: {
    port: 3000,
    htmlFallback: "index",
    historyApiFallback: true,
  },
});
