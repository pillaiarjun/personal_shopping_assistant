// Builds web/sasha-live.ts (plus livekit-client) into one ES module the static site loads:
//   v2/web/dist/sasha-live.js   (committed: the site has no bundler)
// Rebuild after editing: npm run build:web
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: fileURLToPath(new URL('./dist', import.meta.url)),
    emptyOutDir: true,
    target: 'es2022',
    sourcemap: false,
    lib: { entry: fileURLToPath(new URL('./sasha-live.ts', import.meta.url)), formats: ['es'], fileName: () => 'sasha-live.js' },
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});
