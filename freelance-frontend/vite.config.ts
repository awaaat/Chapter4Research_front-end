import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            // API requests
            '/api': {
                target: 'http://localhost:8001',
                changeOrigin: true,
                secure: false,
            },
            // ✅ ADD: WebSocket support for real-time notifications
            '/ws': {
                target: 'ws://localhost:8001',
                ws: true,
                changeOrigin: true,
            },
        },
    },
    // ✅ PERFORMANCE: Optimize build output
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    // Split vendor code for better caching
                    'react-vendor': ['react', 'react-dom', 'react-router-dom'],
                    'ui-vendor': ['lucide-react', 'react-hot-toast', 'react-modal'],
                },
            },
        },
        // Increase chunk size warning limit (default is 500kb)
        chunkSizeWarningLimit: 1000,
    },
    // ✅ OPTIMIZATION: Enable source maps for debugging (disable in production)
    ...(process.env.NODE_ENV === 'development' && {
        css: {
            devSourcemap: true,
        },
    }),
})