/**
 * 开支估算器的数据。金额单位：元。
 * 这些是 2025–2026 年市场价的大致区间，只用来看量级。
 * 拿到自己城市和医院的真实报价后，直接改这里的数字，或在页面上填"实际金额"。
 * tier: true 表示这一项随城市等级浮动（人工和服务类）。
 */

export interface CostOption {
  id: string;
  label: string;
  low: number;
  high: number;
  tier?: boolean;
}

export interface CostCategory {
  id: string;
  title: string;
  phase: string;
  note?: string;
  default: string;
  options: CostOption[];
}

export const tiers = [
  { id: 't1', label: '一线', factor: 1 },
  { id: 't2', label: '新一线、二线', factor: 0.7 },
  { id: 't3', label: '三线及以下', factor: 0.5 },
];

export const phases = ['孕前', '孕期', '分娩', '月子', '第一年'];

export const categories: CostCategory[] = [
  {
    id: 'prep',
    title: '孕前检查与准备',
    phase: '孕前',
    default: 'free',
    options: [
      { id: 'free', label: '免费孕检 + 叶酸', low: 300, high: 1500 },
      { id: 'paid', label: '自费体检套餐 + 看牙', low: 2000, high: 6000 },
    ],
  },
  {
    id: 'prenatal',
    title: '产检',
    phase: '孕期',
    note: '报销前。生育保险对产检多是定额报销，一两千到三千元。',
    default: 'public',
    options: [
      { id: 'public', label: '公立普通门诊', low: 5000, high: 10000 },
      { id: 'vip', label: '公立特需或国际部', low: 20000, high: 50000, tier: true },
      { id: 'private', label: '私立医院套餐', low: 20000, high: 60000, tier: true },
    ],
  },
  {
    id: 'living',
    title: '孕期用品与补充剂',
    phase: '孕期',
    note: '孕妇装、内衣、孕妇枕、复合维生素、DHA、钙。',
    default: 'normal',
    options: [
      { id: 'lean', label: '精简', low: 2000, high: 4000 },
      { id: 'normal', label: '常规', low: 4000, high: 10000 },
    ],
  },
  {
    id: 'delivery',
    title: '分娩住院',
    phase: '分娩',
    note: '报销前。公立医院报销后自付常在几百到几千元。',
    default: 'public-v',
    options: [
      { id: 'public-v', label: '公立 · 顺产', low: 4000, high: 10000 },
      { id: 'public-c', label: '公立 · 剖宫产', low: 8000, high: 18000 },
      { id: 'vip', label: '公立特需或国际部', low: 30000, high: 80000, tier: true },
      { id: 'private-v', label: '私立 · 顺产', low: 30000, high: 80000, tier: true },
      { id: 'private-c', label: '私立 · 剖宫产', low: 50000, high: 120000, tier: true },
    ],
  },
  {
    id: 'confinement',
    title: '月子',
    phase: '月子',
    default: 'nanny26',
    options: [
      { id: 'family', label: '家人照顾', low: 3000, high: 10000 },
      { id: 'nanny26', label: '月嫂 26 天', low: 12000, high: 26000, tier: true },
      { id: 'nanny42', label: '月嫂 42 天', low: 20000, high: 42000, tier: true },
      { id: 'center', label: '月子中心 28 天 · 中档', low: 35000, high: 80000, tier: true },
      { id: 'center-hi', label: '月子中心 28 天 · 高端', low: 100000, high: 300000, tier: true },
    ],
  },
  {
    id: 'recovery',
    title: '产后康复',
    phase: '月子',
    default: 'self',
    options: [
      { id: 'self', label: '42 天复查 + 在家练', low: 200, high: 800 },
      { id: 'hospital', label: '公立医院盆底康复', low: 2000, high: 6000 },
      { id: 'studio', label: '产康机构套餐', low: 10000, high: 30000, tier: true },
    ],
  },
  {
    id: 'gear',
    title: '新生儿用品',
    phase: '第一年',
    note: '一次性投入：床、推车、安全座椅、吸奶器、衣物寝具。',
    default: 'normal',
    options: [
      { id: 'lean', label: '精简，多用二手和亲友传的', low: 5000, high: 10000 },
      { id: 'normal', label: '常规', low: 10000, high: 20000 },
      { id: 'rich', label: '宽松', low: 20000, high: 40000 },
    ],
  },
  {
    id: 'feeding',
    title: '喂养',
    phase: '第一年',
    default: 'mixed',
    options: [
      { id: 'breast', label: '母乳为主', low: 1000, high: 3000 },
      { id: 'mixed', label: '混合喂养', low: 5000, high: 10000 },
      { id: 'formula', label: '全配方奶', low: 10000, high: 20000 },
    ],
  },
  {
    id: 'diapers',
    title: '尿不湿与日用消耗',
    phase: '第一年',
    default: 'normal',
    options: [{ id: 'normal', label: '常规', low: 4000, high: 9000 }],
  },
  {
    id: 'vaccine',
    title: '自费疫苗',
    phase: '第一年',
    default: 'some',
    options: [
      { id: 'none', label: '只打免费的', low: 0, high: 0 },
      { id: 'some', label: '挑重点：13 价肺炎、轮状', low: 3000, high: 4500 },
      { id: 'all', label: '能换自费的都换', low: 6000, high: 9000 },
    ],
  },
  {
    id: 'health',
    title: '保险与看病',
    phase: '第一年',
    default: 'basic',
    options: [
      { id: 'basic', label: '少儿医保 + 偶尔门诊', low: 1000, high: 3000 },
      { id: 'plus', label: '加商业医疗险和重疾险', low: 3000, high: 8000 },
    ],
  },
  {
    id: 'childcare',
    title: '照护人手',
    phase: '第一年',
    note: '第一年里弹性最大的一项。',
    default: 'family',
    options: [
      { id: 'family', label: '父母和老人自己带', low: 0, high: 24000 },
      { id: 'day', label: '白班阿姨', low: 60000, high: 100000, tier: true },
      { id: 'live-in', label: '住家育儿嫂', low: 90000, high: 160000, tier: true },
    ],
  },
];
