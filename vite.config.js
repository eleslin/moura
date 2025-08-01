import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import path from "path";
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
            manifest: {
                name: 'Moura Training App',
                short_name: 'Moura',
                description: 'Tus guías de entrenamiento personalizadas',
                theme_color: '#3b82f6',
                background_color: '#ffffff',
                display: 'standalone',
                start_url: '/',
                icons: [
                    {
                        src: 'public/assets/128.png',
                        sizes: '128x128',
                        type: 'image/png'
                    },
                    {
                        src: 'public/assets/144.png',
                        sizes: '144x144',
                        type: 'image/png'
                    },
                    {
                        src: 'public/assets/192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'public/assets/512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                ]
            }
        })
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
});
