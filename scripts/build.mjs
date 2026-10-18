import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const data = JSON.parse(await readFile('capability_map.json','utf8'));
const guides = JSON.parse(await readFile('research/technology-guides.json','utf8'));
const baseSourceCount = data.sources.length;
const sourceByUrl = new Map(data.sources.filter(s=>s.url).map(s=>[s.url,s]));
const sourceById = new Map(data.sources.map(s=>[s.id,s]));
const guideIds = Object.keys(guides);
if(guideIds.length !== data.chemistry.length || data.chemistry.some(k=>!guides[k.id])) throw new Error('Every existing capability must have one technology guide.');
for(const capability of data.chemistry){
  const raw = guides[capability.id];
  const alias = new Map();
  for(const ref of raw.sources){
    if(!/^https?:\/\//.test(ref.url)) throw new Error(`Invalid technology source URL: ${ref.id}`);
    let source = sourceByUrl.get(ref.url);
    if(!source){
      if(sourceById.has(ref.id)) throw new Error(`Duplicate source ID: ${ref.id}`);
      source={...ref,used_by:[]};
      data.sources.push(source);sourceByUrl.set(source.url,source);sourceById.set(source.id,source);
    }
    if(ref.published && !source.published)source.published=ref.published;
    if(!source.used_by.some(u=>u.kind==='chemistry'&&u.id===capability.id))source.used_by.push({kind:'chemistry',id:capability.id});
    alias.set(ref.id,source.id);
  }
  const guide=JSON.parse(JSON.stringify(raw));
  delete guide.sources;
  guide.source_ids=[...new Set(raw.sources.map(ref=>alias.get(ref.id)))];
  const rewriteRefs=value=>{
    if(!value||typeof value!=='object')return;
    if(Array.isArray(value.refs))value.refs=value.refs.map(id=>{
      if(!alias.has(id))throw new Error(`Unknown reference ${capability.id}/${id}`);
      return alias.get(id);
    });
    Object.values(value).forEach(rewriteRefs);
  };
  rewriteRefs(guide);
  for(const section of ['what','value_chain','actors','mineral_links','expansion','constraints']){
    if(!Array.isArray(guide[section])||!guide[section].length)throw new Error(`Missing ${capability.id}/${section}`);
    for(const block of guide[section])if(!block.refs?.length)throw new Error(`Unreferenced research block: ${capability.id}/${section}`);
  }
  const explained=new Set(guide.mineral_links.flatMap(link=>link.minerals));
  if(capability.minerals.some(id=>!explained.has(id)))throw new Error(`Missing mineral explanation in ${capability.id}`);
  if([...explained].some(id=>!data.minerals.some(m=>m.id===id)))throw new Error(`Unknown mineral in ${capability.id}`);
  if(guide.related_strategies.some(id=>!data.strategies.some(s=>s.id===id)))throw new Error(`Unknown strategy in ${capability.id}`);
  capability.guide=guide;
}
data.meta.base_source_count=baseSourceCount;
data.meta.expected_source_count=data.sources.length;
data.meta.technology_research_date='2026-10-19';
await mkdir('dist',{recursive:true});
for(const f of ['index.html','style.css','app.js']) await copyFile(`src/${f}`,`dist/${f}`);
let html = await readFile('src/index.html','utf8');
for(const file of ['style.css','app.js']) {
  const version = createHash('sha256').update(await readFile(`src/${file}`)).digest('hex').slice(0,12);
  html = html.replaceAll(`"${file}"`, `"${file}?v=${version}"`);
}
await writeFile('dist/index.html',html);
await writeFile('dist/capability_map.json',JSON.stringify(data));
// Classic-script fallback keeps the exported folder usable over file:// too.
await writeFile('dist/data.js',`window.CAPABILITY_DATA=${JSON.stringify(data)};\n`);
console.log(`Built ${data.minerals.length} minerals, ${data.strategies.length} strategies, ${data.sources.length} sources.`);
