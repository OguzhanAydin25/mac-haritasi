// Siteyi dist/ klasörüne derler: dist/index.html + dist/data/*.json
import * as esbuild from 'esbuild';
import fs from 'node:fs/promises';

const r = await esbuild.build({ entryPoints: ['src/boot.js'], bundle: true, minify: true, format: 'iife', write: false, loader: { '.json': 'json' }, target: 'es2020', legalComments: 'none' });
const js = r.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const html = (await fs.readFile('src/index.html', 'utf8')).replace('<script>/*APP*/</script>', () => '<script>' + js + '</script>');
await fs.mkdir('dist/data', { recursive: true });
await fs.writeFile('dist/index.html', html);
for (const f of ['season.json', 'events.json', 'demo.json']) { try { await fs.copyFile('data/' + f, 'dist/data/' + f); } catch { /* yoksa geç */ } }
await fs.writeFile('dist/.nojekyll', '');
console.log('dist/index.html', (html.length / 1024).toFixed(0), 'KB');
