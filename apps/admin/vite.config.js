import { defineConfig } from 'vite';
import path from "node:path";
import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
// https://vite.dev/config/
export default defineConfig({
    plugins: [
        tanstackRouter({
            target: 'react',
            autoCodeSplitting: true,
        }),
        react()
    ],
    resolve: {
        alias: {
            "@repo/ui": path.resolve(__dirname, "../../packages/ui/src"),
        },
    },
    server: {
        port: 5173,
    },
});
