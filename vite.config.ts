import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // This helps manage the 500kB warning
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunking splits large libraries into their own files
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-utils': ['@tanstack/react-query', 'lucide-react'],
          'vendor-firebase': ['@capacitor-firebase/authentication', '@capacitor-firebase/messaging'],
        },
      },
    },
  },
}));