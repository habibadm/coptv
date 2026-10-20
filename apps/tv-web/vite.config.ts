import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  // Rutas relativas: Tizen y webOS cargan la app desde el sistema de archivos del TV.
  base: './',
  build: {
    // Televisores de 2018 en adelante (Chromium 56+ en Tizen 5, 53+ en webOS 4).
    target: 'es2017',
  },
});
