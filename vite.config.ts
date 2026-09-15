/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const MOCK_SERVER_URL = 'http://localhost:3001';

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
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
