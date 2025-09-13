import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      '**/*.test.ts',
      '**/*.test.js',
      '**/*.spec.ts',
      '**/*.spec.js'
    ],
    exclude: [
      '**/*.regression.ts',
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**'
    ]
  }
});
