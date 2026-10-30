import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

export default defineConfig({
  base: "./",
  publicDir: "public",
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  build: {
    outDir: "dist", emptyOutDir: true, sourcemap: false,
    rolldownOptions: { output: { codeSplitting: { groups: [{
      debugName: "static-browser-libraries",
      name(id) {
        if (id.includes("/generated/validators.cjs")) return "validators";
        if (/node_modules\/(recharts|d3-|victory|@reduxjs|redux|immer|reselect|react-redux)/.test(id)) return "charts";
        if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return "react";
        return null;
      },
    }] } } },
  },
});
