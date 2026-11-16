import { getCollection, type CollectionEntry } from 'astro:content';
import { groups, verdicts, type Verdict } from '@/data/site';
import { anchorId } from './anchor';

export type Doc = CollectionEntry<'docs'>;

export const groupOf = (doc: Doc) => doc.id.split('/')[0];
export const hrefOf = (doc: Doc) => `/${doc.id}/`;

/** 全部页面，按分组顺序、再按 order 排好 */
export async function allDocs(): Promise<Doc[]> {
  const docs = await getCollection('docs');
  const known = new Set(groups.map((g) => g.id));
  for (const d of docs) {
    if (!known.has(groupOf(d))) {
      throw new Error(`页面 ${d.id} 所在的文件夹 "${groupOf(d)}" 没有在 src/data/site.ts 的 groups 里定义`);
    }
  }
  const gi = (d: Doc) => groups.findIndex((g) => g.id === groupOf(d));
  return docs.sort((a, b) => gi(a) - gi(b) || a.data.order - b.data.order);
}

export function docsIn(docs: Doc[], groupId: string): Doc[] {
  return docs.filter((d) => groupOf(d) === groupId);
}

export interface Knowledge {
  kind: 'point' | 'issue';
  id: string;
  title: string;
  verdict?: Verdict;
  gist: string;
  rate?: string;
  docId: string;
  docTitle: string;
  group: string;
  href: string;
  /** 展开后的正文，去掉了标记，给搜索用 */
  text: string;
}

const BLOCK = /<(Point|Issue)\b([^>]*)>([\s\S]*?)<\/\1>/g;
const ATTR = /(\w+)="([^"]*)"/g;

function plain(mdx: string): string {
  return mdx
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`#>|-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 从页面正文里找出所有 <Point> 和 <Issue>。
 * 靠正则，所以属性必须写成 name="值" 的形式，值里不能有 > 和双引号。
 */
export function knowledgeOf(doc: Doc): Knowledge[] {
  const body = doc.body ?? '';
  const out: Knowledge[] = [];
  for (const m of body.matchAll(BLOCK)) {
    const attrs: Record<string, string> = {};
    for (const a of m[2].matchAll(ATTR)) attrs[a[1]] = a[2];
    if (!attrs.title) continue;
    const kind = m[1] === 'Point' ? 'point' : 'issue';
    const verdict = (attrs.verdict in verdicts ? attrs.verdict : 'info') as Verdict;
    const id = attrs.id ?? anchorId(attrs.title);
    out.push({
      kind,
      id,
      title: attrs.title,
      verdict: kind === 'point' ? verdict : undefined,
      gist: attrs.gist ?? '',
      rate: attrs.rate,
      docId: doc.id,
      docTitle: doc.data.title,
      group: groupOf(doc),
      href: `${hrefOf(doc)}#${id}`,
      text: plain(m[3]),
    });
  }
  return out;
}

/** 页面里的小标题、清单和提示框的标题，给搜索用，这样搜“面试月嫂”能找到所在的页面 */
export function headingsOf(doc: Doc): string {
  const body = doc.body ?? '';
  const heads = [...body.matchAll(/^#{2,3}\s+(.+)$/gm)].map((m) => m[1]);
  const titles = [...body.matchAll(/<(?:Checklist|Note)\b[^>]*\btitle="([^"]*)"/g)].map((m) => m[1]);
  return [...heads, ...titles].join(' ');
}

export async function allKnowledge(): Promise<Knowledge[]> {
  const docs = await allDocs();
  return docs.filter((d) => d.data.status !== 'planned').flatMap(knowledgeOf);
}
