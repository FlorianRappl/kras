const { resolve } = require('path');
const { buildSync } = require('esbuild');

buildSync({
  entryPoints: ['src/server/index.ts'],
  external: ['bufferutil', 'utf-8-validate', 'fsevents'],
  outdir: resolve(__dirname, 'dist', 'server'),
  // minify: true,
  bundle: true,
  target: 'node16',
  platform: 'node',
  format: 'cjs',
});
