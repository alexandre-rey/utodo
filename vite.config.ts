import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-vite-plugin'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  build: {
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom', 'i18next', 'react-i18next', 'lucide-react'],
          'ui': ['@/components/ui/button', '@/components/ui/card', '@/components/ui/dialog', '@/components/ui/badge'],
          'contexts': ['@/contexts/TodosContext', '@/contexts/SettingsContext', '@/contexts/AuthContext', '@/contexts/AppContext'],
          'routing': ['@tanstack/react-router'],
          'crypto': ['crypto-js'],
          'stripe': ['@stripe/stripe-js', '@stripe/react-stripe-js'],
        },
        // Optimize chunk naming for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? path.basename(chunkInfo.facadeModuleId, '.tsx').replace('.', '-') : 'chunk';
          return `assets/${facadeModuleId}-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const extType = path.extname(assetInfo.name || '').substring(1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(extType)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    // Enable source maps for better debugging in production
    sourcemap: true,
    // Improve build performance
    reportCompressedSize: false,
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
  },
  // Performance optimizations
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'i18next', 
      'react-i18next', 
      'lucide-react',
      '@tanstack/react-router',
      'crypto-js',
      'dompurify'
    ],
  },
  // Server configuration for better development experience
  server: {
    port: 5173,
    strictPort: true
  },
  // Preview configuration
  preview: {
    port: 4173,
    strictPort: true
  }
})
