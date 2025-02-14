import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'url';

export default defineConfig({
    plugins: [
        react()
    ],
    server: {
        proxy: {
            '/api': {
                target: 'https://peachpitch.site',  // ✅ 백엔드 서버로 프록시
                changeOrigin: true,
                secure: false,
            }
        }
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
            '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
            '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
            '@recoil': fileURLToPath(new URL('./src/recoil', import.meta.url)),
            '@types': fileURLToPath(new URL('./src/types', import.meta.url)),
            '@apis': fileURLToPath(new URL('./src/apis', import.meta.url)),
            'crypto': 'crypto-browserify'

        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `@use "@assets/styles/main";`,
            },
        },
    },
    define: {
        global: {}
    }
});
