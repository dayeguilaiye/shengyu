import type { APIRoute } from 'astro';
import { allDocs, headingsOf, hrefOf, knowledgeOf } from '@/lib/docs';
import { groupById, statuses } from '@/data/site';
import { glossary } from '@/data/glossary';

/** 搜索索引：页面、知识点、术语。构建时生成一次。 */
export const GET: APIRoute = async () => {
  const docs = await allDocs();
  const items = [
    ...docs.map((d) => ({
      t: 'page',
      title: d.data.title,
      sub: `${groupById(d.id.split('/')[0])!.title} · ${d.data.status === 'planned' ? statuses.planned + ' · ' : ''}${d.data.summary}`,
      href: hrefOf(d),
      text: [d.data.heading ?? '', ...d.data.outline, headingsOf(d)].join(' '),
    })),
    ...docs
      .filter((d) => d.data.status !== 'planned')
      .flatMap(knowledgeOf)
      .map((k) => ({
        t: k.kind,
        title: k.title,
        sub: k.gist || k.docTitle,
        href: k.href,
        text: `${k.docTitle} ${k.text}`,
      })),
    ...glossary.map((g) => ({
      t: 'term',
      title: g.term,
      sub: g.def,
      href: `/glossary/#t-${g.k}`,
      text: g.full ?? '',
    })),
  ];
  return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
