/**
 * “你现在在哪一步”：存在 localStorage 里，全站共用。
 * 首页时间尺、侧栏的“现在”标记、产检时间表都读它。
 */
import { windows, type ExamWindow } from '@/data/prenatal';

export type Mode = 'prep' | 'pregnant' | 'born';

export interface Profile {
  mode: Mode;
  /** 怀孕中：用户填的是预产期还是末次月经 */
  basis?: 'edd' | 'lmp';
  /** 预产期，yyyy-mm-dd */
  edd?: string;
  /** 出生日期，yyyy-mm-dd */
  birth?: string;
}

const KEY = 'yy:profile';
const DAY = 86_400_000;

export function getProfile(): Profile | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Profile) : null;
  } catch {
    return null;
  }
}

export function setProfile(p: Profile | null) {
  try {
    p ? localStorage.setItem(KEY, JSON.stringify(p)) : localStorage.removeItem(KEY);
  } catch {}
  window.dispatchEvent(new CustomEvent('yy:profile'));
}

export function onProfile(cb: (p: Profile | null) => void) {
  cb(getProfile());
  window.addEventListener('yy:profile', () => cb(getProfile()));
  window.addEventListener('storage', (e) => e.key === KEY && cb(getProfile()));
}

export const parseDate = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const toISO = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const today = () => {
  const n = new Date();
  return new Date(n.getFullYear(), n.getMonth(), n.getDate());
};
export const diffDays = (a: Date, b: Date) => Math.round((a.getTime() - b.getTime()) / DAY);
export const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};
export const fmtDate = (d: Date) => `${d.getMonth() + 1} 月 ${d.getDate()} 日`;

/** 孕龄天数。没有预产期时返回 null */
export function gaDays(p: Profile | null, now = today()): number | null {
  if (p?.mode !== 'pregnant' || !p.edd) return null;
  return 280 - diffDays(parseDate(p.edd), now);
}

/** 孕龄第 n 天对应的日期 */
export function dateAtGa(p: Profile, ga: number): Date {
  return addDays(parseDate(p.edd!), ga - 280);
}

export const fmtGa = (ga: number) => {
  const w = Math.floor(ga / 7);
  const d = ga % 7;
  return d ? `孕 ${w} 周 + ${d} 天` : `孕 ${w} 周`;
};

export interface Status {
  /** 所处阶段的分组 id */
  stage: string | null;
  /** 在该阶段里走了多少，0–1 */
  frac: number;
  title: string;
  text: string;
  /** 日期不合理时的提示 */
  problem?: string;
}

const clamp = (n: number) => Math.max(0, Math.min(1, n));

export function statusOf(p: Profile | null, now = today()): Status | null {
  if (!p) return null;

  if (p.mode === 'prep') {
    return { stage: 'prep', frac: 0.5, title: '备孕中', text: '从孕前检查看起。' };
  }

  if (p.mode === 'pregnant') {
    const ga = gaDays(p, now);
    if (ga === null) return { stage: null, frac: 0, title: '', text: '', problem: '填上预产期或末次月经第一天。' };
    if (ga < 0) return { stage: null, frac: 0, title: '', text: '', problem: '这个日期算出来还没怀上，检查一下填的是哪一天。' };
    if (ga > 44 * 7) return { stage: null, frac: 0, title: '', text: '', problem: '按这个日期已经过预产期一个月了。孩子出生了的话，改选“孩子已出生”。' };
    const left = 280 - ga;
    const stage = ga < 98 ? 't1' : ga < 196 ? 't2' : 't3';
    const frac = stage === 't1' ? ga / 98 : stage === 't2' ? (ga - 98) / 98 : (ga - 196) / 84;
    const name = { t1: '孕早期', t2: '孕中期', t3: '孕晚期' }[stage];
    const text = left > 0 ? `${name}，距预产期 ${left} 天。` : left === 0 ? `${name}，今天是预产期。` : `已过预产期 ${-left} 天。`;
    return { stage, frac: clamp(frac), title: fmtGa(ga), text };
  }

  if (!p.birth) return { stage: null, frac: 0, title: '', text: '', problem: '填上出生日期。' };
  const birth = parseDate(p.birth);
  const age = diffDays(now, birth);
  if (age < 0) return { stage: null, frac: 0, title: '', text: '', problem: '出生日期在未来。还没生的话，改选“怀孕中”。' };

  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (now.getDate() < birth.getDate()) months -= 1;
  const days = diffDays(now, new Date(birth.getFullYear(), birth.getMonth() + months, birth.getDate()));
  const title =
    months < 1
      ? `出生第 ${age + 1} 天`
      : months < 12
        ? `${months} 个月${days ? ` ${days} 天` : ''}`
        : `${Math.floor(months / 12)} 岁${months % 12 ? ` ${months % 12} 个月` : ''}`;

  if (age <= 42) return { stage: 'postpartum', frac: clamp(age / 42), title, text: '还在产后六周内，妈妈的恢复和新生儿同样要紧。' };
  if (months < 12) return { stage: 'infant', frac: clamp(age / 365), title, text: '婴儿期。' };
  if (months < 36) return { stage: 'toddler', frac: clamp((months - 12) / 24), title, text: '幼儿期。' };
  return { stage: 'toddler', frac: 1, title, text: '已经超出这本手册覆盖的三岁了。' };
}

/** 当前正在窗口内的、和接下来最近的有时间窗的检查 */
export function examsAround(ga: number): { current: ExamWindow[]; next: ExamWindow | null } {
  const current = windows.filter((x) => x.from <= ga && ga <= x.to);
  const next = windows.filter((x) => x.from > ga).sort((a, b) => a.from - b.from)[0] ?? null;
  return { current, next };
}
