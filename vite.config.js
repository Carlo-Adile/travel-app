import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      external: []  // Solo se necessario, altrimenti lascialo vuoto
    }
  }
});