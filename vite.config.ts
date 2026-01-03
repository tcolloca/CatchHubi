import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
    root: 'src',
    publicDir: './public',
    base: './', // Important for relative paths on file://
    plugins: [viteSingleFile()],
    build: {
        outDir: '../',
        emptyOutDir: false,
        assetsInlineLimit: 100000000, // Try to inline everything
    },
    server: {
        open: true,
    },
});
