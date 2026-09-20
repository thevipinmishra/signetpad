import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'node',
          environment: 'node',
          include: [
            'test/core/**/*.test.ts',
            'test/canvas/**/*.test.ts',
            'test/tree-shake.test.ts',
          ],
        },
      },
      {
        test: {
          name: 'dom',
          environment: 'jsdom',
          include: [
            'test/react/**/*.test.tsx',
            'test/vue/**/*.test.ts',
            'test/svelte/**/*.test.ts',
            'test/react-native/**/*.test.tsx',
            'test/react-native-svg/**/*.test.ts',
          ],
        },
      },
    ],
  },
});
