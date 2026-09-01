import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
// envPrefix keeps REACT_APP_* env vars (from CRA / F9) exposed on import.meta.env.
// build.outDir 'build' keeps netlify.toml's publish="build" unchanged.
// This app keeps JSX in .js files (CRA convention, not .jsx); tell esbuild to
// parse .js under src/ with the JSX loader so Vite can build it.
export default defineConfig({
  plugins: [react({ include: /\.(js|jsx)$/ })],
  envPrefix: ['VITE_', 'REACT_APP_'],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.js$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
  build: {
    outDir: 'build',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
  },
});
