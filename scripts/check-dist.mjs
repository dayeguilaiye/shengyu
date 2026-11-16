import { readFile, access } from 'node:fs/promises';
for (const path of ['index.html', 'prep/supplements/index.html', 'glossary/index.html', 'plan/index.html']) {
  const html = await readFile(`dist/${path}`, 'utf8');
  if (!html.includes('<html')) throw new Error(`Invalid page: ${path}`);
}
const index = JSON.parse(await readFile('dist/search.json', 'utf8'));
if (!Array.isArray(index) || !index.length) throw new Error('Empty search index');
for (const item of index) {
  const path = item.href.split('#')[0];
  await access(`dist${path.endsWith('/') ? path : path + '/'}index.html`);
}
console.log(`Validated pages and ${index.length} search entries`);
