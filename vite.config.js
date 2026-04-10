import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        article: fileURLToPath(new URL('./article.html', import.meta.url)),
      },
      output: {
        manualChunks: {
          vue: ['vue'],
          markdown: ['marked', 'highlight.js'],
        },
      },
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3031',
        changeOrigin: true,
      },
    },
    historyApiFallback: true,
  },
});
