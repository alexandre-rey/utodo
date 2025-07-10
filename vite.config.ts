import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'i18next', 'react-i18next', 'lucide-react'],
          'ui': ['@/components/ui/button', '@/components/ui/card', '@/components/ui/dialog', '@/components/ui/badge'],
          'contexts': ['@/contexts/TodosContext', '@/contexts/SettingsContext', '@/contexts/AuthContext', '@/contexts/AppContext'],
        }
      }
    }
  },
  plugins: [
    react(),
    tailwindcss(),
    TanStackRouterVite()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    }
  }
})
