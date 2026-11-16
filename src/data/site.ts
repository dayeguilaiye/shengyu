/**
 * 全站骨架：分组、知识点的结论类型、页面类型。
 * 加一个分组 = 在 groups 里加一项 + 在 src/content/docs/ 下建同名文件夹。
 */

export type GroupKind = 'stage' | 'topic';

export interface Group {
  id: string;
  kind: GroupKind;
  title: string;
  /** 时间尺上用的短名 */
  short?: string;
  /** 时间范围，只有阶段有 */
  range?: string;
  blurb: string;
  /** 时间尺上的相对宽度 */
  weight?: number;
}

export const groups: Group[] = [
  // —— 按时间 ——
  { id: 'prep', kind: 'stage', title: '备孕', range: '孕前 3–6 个月', weight: 3, blurb: '把身体、钱和分工先理一遍，再开始试。' },
  { id: 't1', kind: 'stage', title: '孕早期', short: '孕早', range: '第 1–13 周', weight: 3, blurb: '确认怀孕、建档、熬孕吐。流产风险集中在这一段。' },
  { id: 't2', kind: 'stage', title: '孕中期', short: '孕中', range: '第 14–27 周', weight: 3, blurb: '身体最舒服的三个月，也是几项关键筛查的窗口。' },
  { id: 't3', kind: 'stage', title: '孕晚期', short: '孕晚', range: '第 28 周到分娩', weight: 3, blurb: '产检变密，开始为分娩和月子做具体准备。' },
  { id: 'birth', kind: 'stage', title: '分娩', range: '住院 3–6 天', weight: 2.2, blurb: '产程、镇痛、分娩方式，以及住院那几天。' },
  { id: 'postpartum', kind: 'stage', title: '产后', short: '月子', range: '产后 0–6 周', weight: 2.4, blurb: '身体恢复和新手期叠在一起的六周。' },
  { id: 'infant', kind: 'stage', title: '婴儿期', short: '0–1 岁', range: '0–12 个月', weight: 3, blurb: '吃、睡、长、病，四件事占满第一年。' },
  { id: 'toddler', kind: 'stage', title: '幼儿期', short: '1–3 岁', range: '1–3 岁', weight: 3, blurb: '会走会说之后：吃饭、规矩、托育。' },
  // —— 按专题 ——
  { id: 'body', kind: 'topic', title: '身体与恢复', blurb: '怀孕和分娩对身体做了什么，怎么防，怎么恢复。' },
  { id: 'food', kind: 'topic', title: '吃', blurb: '能吃什么，要补什么，吃多少。' },
  { id: 'money', kind: 'topic', title: '钱与政策', blurb: '花多少，报多少，假怎么休，证怎么办。' },
  { id: 'care', kind: 'topic', title: '人手与分工', blurb: '谁照顾产妇和孩子，夜里谁起。' },
  { id: 'gear', kind: 'topic', title: '物品', blurb: '该买的，可买可不买的，别买的。' },
  { id: 'tools', kind: 'topic', title: '工具与速查', blurb: '时间表、清单，和着急时翻的页面。' },
];

export const stages = groups.filter((g) => g.kind === 'stage');
export const topics = groups.filter((g) => g.kind === 'topic');
export const groupById = (id: string) => groups.find((g) => g.id === id);

/** 知识点的结论类型。tone 决定颜色：red / amber / green / slate / ink */
export const verdicts = {
  avoid: { label: '避免', tone: 'red' },
  limit: { label: '限量', tone: 'amber' },
  care: { label: '留意', tone: 'amber' },
  do: { label: '要做', tone: 'green' },
  ok: { label: '可以', tone: 'green' },
  myth: { label: '误区', tone: 'slate' },
  info: { label: '须知', tone: 'ink' },
} as const;

export type Verdict = keyof typeof verdicts;

export const kinds = {
  guide: '说明',
  decision: '决策',
  checklist: '清单',
  tool: '工具',
  reference: '速查',
} as const;

export const priorities = {
  1: '先写',
  2: '其次',
  3: '以后',
} as const;

export const statuses = {
  done: '已写',
  draft: '草稿',
  planned: '待写',
} as const;
