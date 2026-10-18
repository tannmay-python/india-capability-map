import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const data = JSON.parse(await readFile('capability_map.json','utf8'));
await mkdir('dist',{recursive:true});
for(const f of ['index.html','style.css','app.js']) await copyFile(`src/${f}`,`dist/${f}`);
let html = await readFile('src/index.html','utf8');
for(const file of ['style.css','app.js']) {
  const version = createHash('sha256').update(await readFile(`src/${file}`)).digest('hex').slice(0,12);
  html = html.replaceAll(`"${file}"`, `"${file}?v=${version}"`);
}
await writeFile('dist/index.html',html);
await copyFile('capability_map.json','dist/capability_map.json');
// Classic-script fallback keeps the exported folder usable over file:// too.
await writeFile('dist/data.js',`window.CAPABILITY_DATA=${JSON.stringify(data)};\n`);
console.log(`Built ${data.minerals.length} minerals, ${data.strategies.length} strategies, ${data.sources.length} sources.`);
