/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@core': path.resolve(__dirname, './src/core'),
            '@ai': path.resolve(__dirname, './src/ai'),
            '@services': path.resolve(__dirname, './src/services'),
            '@state': path.resolve(__dirname, './src/state'),
            '@features': path.resolve(__dirname, './src/features'),
            '@shared': path.resolve(__dirname, './src/shared'),
            '@data': path.resolve(__dirname, './src/data'),
            '@gametypes': path.resolve(__dirname, './src/types'),
            '@i18n': path.resolve(__dirname, './src/i18n'),
        },
    },
    server: {
        port: 5173,
        open: true,
    },
    build: {
        target: 'es2022',
        sourcemap: true,
        chunkSizeWarningLimit: 600,
        rollupOptions: {
            output: {
                manualChunks: function (id) {
                    // Vendor splits — cache lâu (lib ít đổi)
                    if (id.includes('node_modules/react'))
                        return 'react';
                    if (id.includes('node_modules/firebase'))
                        return 'firebase';
                    if (id.includes('node_modules/konva') || id.includes('node_modules/react-konva'))
                        return 'konva';
                    if (id.includes('node_modules/framer-motion'))
                        return 'framer';
                    if (id.includes('node_modules/lottie'))
                        return 'lottie';
                    if (id.includes('node_modules/zod'))
                        return 'zod';
                    if (id.includes('node_modules/zustand') || id.includes('node_modules/immer'))
                        return 'state-lib';
                    // App splits — lazy() + manualChunks giúp gom share dependencies
                    if (id.includes('/src/features/tutorial/'))
                        return 'feat-tutorial';
                    if (id.includes('/src/features/save-manager/'))
                        return 'feat-save';
                    if (id.includes('/src/features/secret-realm/') || id.includes('/src/core/world/secret-realm-gen'))
                        return 'feat-secret-realm';
                    if (id.includes('/src/features/cave-abode/'))
                        return 'feat-cave-abode';
                    if (id.includes('/src/features/sect-hall/'))
                        return 'feat-sect';
                    if (id.includes('/src/features/spirit-beasts/'))
                        return 'feat-beasts';
                    if (id.includes('/src/features/world-map/'))
                        return 'feat-map';
                    if (id.includes('/src/features/combat/') || id.includes('/src/core/combat/'))
                        return 'feat-combat';
                    if (id.includes('/src/features/tribulation/'))
                        return 'feat-tribulation';
                    return undefined;
                },
            },
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        coverage: {
            provider: 'v8',
            include: ['src/core/**/*.ts', 'src/data/**/*.ts'],
            reporter: ['text', 'html'],
        },
    },
});
