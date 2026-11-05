import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// GitHub Pages base path: when deployed to https://<user>.github.io/<repo>/
// the base must be /<repo>/. In development, base is '/'.
// The repo name is derived from the GITHUB_REPOSITORY env var or defaults
// to the repository name for local builds.
const repoName = process.env.GITHUB_REPOSITORY
  ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
  : '/';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: repoName,
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: './dist',
    sourcemap: true,
  },
});
