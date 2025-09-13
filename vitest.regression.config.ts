import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      '**/*.regression.ts'
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**'
    ]
  }
});
