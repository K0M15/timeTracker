import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    server: {
        host: true, // or use your local IP manually e.g., '192.168.1.100'
        port: 5173  // or any port you prefer
    },
    plugins:[
        VitePWA({
            registerType: 'autoUpdate',
            workbox: {
                cleanupOutdatedCaches: true,
                clientsClaim: true,
                skipWaiting: true
            },
            includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
            manifest: {
                name: 'Time Tracker',
                short_name: 'TimeTracker',
                description: 'A simple time tracking application',
                theme_color: '#ffffff',
                icons: [
                    // {
                    //     src: 'pwa-192x192.png',
                    //     sizes: '192x192',
                    //     type: 'image/png'
                    // },
                    // {
                    //     src: 'pwa-512x512.png',
                    //     sizes: '512x512',
                    //     type: 'image/png'
                    // }
                ]
            }
        })
    ]
})