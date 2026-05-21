import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const proxyTarget = process.env.VITE_PROXY || 'http://localhost:3000';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        proxy: {
            '/user': proxyTarget,
            '/match': proxyTarget,
            '/socket.io': {
                target: proxyTarget,
                ws: true
            }
        }
    },
    build: {
        outDir: './build',
        emptyOutDir: true
    }
});
