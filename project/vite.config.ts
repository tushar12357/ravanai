import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server:{
    port:5177
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/widget.tsx'), 
      name: 'ReactWidget',
      fileName: 'react-widget-uv',
      formats: ['iife'], 
    },
    rollupOptions: {
      output: { 
      },
    },
  },
});