/// <reference types="vitest/config" />
import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const MOCK_SERVER_URL = 'http://localhost:3001';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: path.resolve(import.meta.dirname, 'src'),
      shared: path.resolve(import.meta.dirname, 'shared'),
    },
  },
  server: {
    proxy: {
      '/api': MOCK_SERVER_URL,
      '/ws': { target: MOCK_SERVER_URL, ws: true },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'shared/**/*.test.ts', 'server/**/*.test.ts'],
  },
});
