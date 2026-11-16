import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * 每个页面是 src/content/docs/<分组>/<slug>.mdx。
 * 分组由所在文件夹决定，分组本身定义在 src/data/site.ts。
 */
const docs = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/docs' }),
  schema: z.object({
    /** 短标题，用在侧栏和各种列表里，尽量 10 个字以内 */
    title: z.string(),
    /** 页面大标题，不写就用 title */
    heading: z.string().optional(),
    /** 一句话说明这页回答什么问题 */
    summary: z.string(),
    /** 分组内的排序 */
    order: z.number(),
    status: z.enum(['done', 'draft', 'planned']).default('planned'),
    kind: z.enum(['guide', 'decision', 'checklist', 'tool', 'reference']).default('guide'),
    /** 填写优先级：1 先写，2 其次，3 以后 */
    priority: z.number().int().min(1).max(3).default(2),
    /** 这件事发生或要决定的时间点，给人看的文字 */
    when: z.string().optional(),
    /** 决策类页面在"要做的决定"里的排序，按孕周算，孕前为负，产后 > 40 */
    decideAt: z.number().optional(),
    /** 计划覆盖的要点。页面写完后可以留着，不显示 */
    outline: z.array(z.string()).default([]),
    /** 相关页面的 id，如 "food/safety" */
    related: z.array(z.string()).default([]),
    sources: z
      .array(
        z.object({
          title: z.string(),
          org: z.string().optional(),
          year: z.union([z.number(), z.string()]).optional(),
          url: z.string().url().optional(),
        }),
      )
      .default([]),
    updated: z.coerce.date().optional(),
  }),
});

export const collections = { docs };
