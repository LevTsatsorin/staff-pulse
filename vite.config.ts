/// <reference types="vitest/config" />
import { execSync } from 'node:child_process';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const MOCK_SERVER_URL = 'http://localhost:3001';

const readGitVersion = (): string | undefined => {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return undefined;
  }
};

export default defineConfig(({ command }) => {
  // Docker passes VITE_APP_BUILD_VERSION as a build arg (no .git in the image); local builds use the commit.
  const buildVersion = process.env.VITE_APP_BUILD_VERSION ?? readGitVersion();
  if (command === 'build' && buildVersion) process.env.VITE_APP_BUILD_VERSION = buildVersion;

  return {
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
  };
});
