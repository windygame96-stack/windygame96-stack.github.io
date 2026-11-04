// Build-time translation of public, already-published UI text only.
// Never pass visitor inputs, local storage, tokens or backend responses here.
const fs = require('node:fs');
const path = require('node:path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const origin = 'https://www.escapefromhongye.xyz';
const output = path.resolve('assets/product-english-v1.json');
const cachePath = path.resolve('work/product-translation-cache.json');
fs.mkdirSync(path.dirname(cachePath), { recursive: true });
const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, 'utf8')) : {};
const texts = new Set();
const seen = new Set();
const hasChinese = /[\u3400-\u9fff]/;
function add(value) {
  const text = value.trim();
  if (/<[a-z][^>]*>/i.test(text)) {
    for (const fragment of text.replace(/<[^>]+>/g, '\n').split('\n')) if (fragment !== text) add(fragment);
    for (const attr of text.matchAll(/(?:placeholder|title|aria-label)=["']([^"']+)["']/g)) add(attr[1]);
    return;
  }
  if (!hasChinese.test(text) || text.length > 4500 || /^https?:\/\//.test(text)) return;
  texts.add(text);
}
async function read(url) {
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!response.ok) throw Error(`${response.status}: ${new URL(url).pathname}`);
      return await response.text();
    } catch (error) { if (attempt >= 3) throw error; await new Promise((r) => setTimeout(r, 1000)); }
  }
}
async function collect(url) {
  if (seen.has(url)) return;
  seen.add(url);
  const code = await read(url);
  const ast = parser.parse(code, { sourceType: 'unambiguous', plugins: ['jsx'] });
  const deps = new Set();
  const dependency = (value) => {
    if (!/^(?:\.\.?\/|\/)?[\w/.-]+\.js$/.test(value)) return;
    const next = new URL(value, url);
    if (next.origin === origin && !next.pathname.includes('ocr/')) deps.add(next.href);
  };
  traverse(ast, {
    StringLiteral(p) {
      add(p.node.value);
      dependency(p.node.value);
    },
    TemplateElement(p) { const value = p.node.value.cooked || p.node.value.raw; add(value); if (!p.parent.expressions.length) dependency(value); },
  });
  for (const dep of deps) await collect(dep).catch((error) => { if (!error.message.startsWith('404:')) throw error; });
}
async function translateBatch(batch) {
  const input = batch.map((text, i) => `[[${String(i).padStart(4, '0')}]]\n${text}`).join('\n');
  const url = new URL('https://translate.googleapis.com/translate_a/single');
  Object.entries({ client: 'gtx', sl: 'zh-CN', tl: 'en', dt: 't', q: input }).forEach(([k, v]) => url.searchParams.set(k, v));
  const result = JSON.parse(await read(url));
  const translated = result[0].map((item) => item[0]).join('');
  const matches = [...translated.matchAll(/\[\[\s*(\d+)\s*\]\]\s*([\s\S]*?)(?=\[\[\s*\d+\s*\]\]|$)/g)];
  if (matches.length !== batch.length) throw Error(`Translation markers changed: ${matches.length}/${batch.length}`);
  for (const match of matches) {
    const index = Number(match[1]);
    if (!batch[index] || !match[2].trim()) throw Error('Invalid translation');
    cache[batch[index]] = match[2].trim();
  }
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
}
(async () => {
  for (const route of ['/', '/tests/', '/life-drive/', '/relationship-fit/', '/shared-black-cat/', '/boss-translator/', '/learning-workshop/']) {
    const html = await read(origin + route);
    const content = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
    for (const text of content.replace(/<[^>]+>/g, '\n').split('\n')) add(text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' '));
    for (const attr of content.matchAll(/(?:placeholder|title|aria-label)=["']([^"']+)["']/g)) add(attr[1]);
    for (const match of html.matchAll(/<script[^>]+src=["']([^"']+\.js)["']/g)) {
      const url = new URL(match[1], origin + route);
      if (url.origin === origin) await collect(url.href);
    }
  }
  const pending = [...texts].filter((text) => !cache[text]);
  const batches = []; let batch = [], size = 0;
  for (const text of pending) {
    if (size + text.length > 1700 && batch.length) { batches.push(batch); batch = []; size = 0; }
    batch.push(text); size += text.length + 14;
  }
  if (batch.length) batches.push(batch);
  console.log(`Public UI text: ${texts.size}; cached: ${texts.size - pending.length}; batches: ${batches.length}`);
  let cursor = 0;
  await Promise.all([0, 1].map(async () => {
    while (cursor < batches.length) {
      const index = cursor++;
      for (let attempt = 0; ; attempt++) {
        try { await translateBatch(batches[index]); console.log(`Translated ${index + 1}/${batches.length}`); break; }
        catch (error) { if (attempt >= 2) throw error; await new Promise((r) => setTimeout(r, 1500)); }
      }
    }
  }));
  // Keep only fixed text in current published product pages; no runtime translation calls.
  const dictionary = Object.fromEntries([...texts].map((text) => [text, cache[text]]));
  fs.writeFileSync(output, JSON.stringify(dictionary));
  console.log(`Saved ${Object.keys(dictionary).length} fixed translations`);
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
