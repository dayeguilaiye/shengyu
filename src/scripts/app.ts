/**
 * 每个页面都跑的脚本：主题、移动端抽屉、侧栏状态、已读标记、
 * 全部展开、锚点自动展开、本页目录高亮。
 * 各组件自己的交互写在组件文件里。
 */
import { onProfile, statusOf } from './profile';

const root = document.documentElement;
const store = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
};

/* ---- 主题：跟随系统 → 浅色 → 深色 ---- */
const THEMES = ['auto', 'light', 'dark'] as const;
const THEME_LABEL = { auto: '主题：跟随系统', light: '主题：浅色', dark: '主题：深色' };
const media = matchMedia('(prefers-color-scheme: dark)');
function applyTheme(pref: (typeof THEMES)[number]) {
  root.dataset.themePref = pref;
  root.dataset.theme = pref === 'dark' || (pref === 'auto' && media.matches) ? 'dark' : 'light';
  document.querySelectorAll('[data-theme-toggle]').forEach((b) => (b.textContent = THEME_LABEL[pref]));
}
const currentPref = () => (THEMES as readonly string[]).includes(root.dataset.themePref ?? '') ? (root.dataset.themePref as (typeof THEMES)[number]) : 'auto';
applyTheme(currentPref());
media.addEventListener('change', () => applyTheme(currentPref()));
document.querySelectorAll('[data-theme-toggle]').forEach((b) =>
  b.addEventListener('click', () => {
    const next = THEMES[(THEMES.indexOf(currentPref()) + 1) % THEMES.length];
    try {
      localStorage.setItem('yy:theme', next);
    } catch {}
    applyTheme(next);
  }),
);

/* ---- 移动端抽屉 ---- */
const closeDrawer = () => delete root.dataset.drawer;
document.querySelector('[data-drawer-open]')?.addEventListener('click', () => (root.dataset.drawer = 'open'));
document.querySelector('[data-drawer-close]')?.addEventListener('click', closeDrawer);
document.addEventListener('keydown', (e) => e.key === 'Escape' && closeDrawer());

/* ---- 侧栏：记住滚动位置，标出"现在"所在的阶段 ---- */
const side = document.querySelector<HTMLElement>('[data-side]');
if (side) {
  const saved = sessionStorage.getItem('yy:side-scroll');
  if (saved) side.scrollTop = +saved;
  const current = side.querySelector<HTMLElement>('[aria-current="page"]');
  if (current) {
    const r = current.getBoundingClientRect();
    if (r.top < 80 || r.bottom > window.innerHeight - 40) current.scrollIntoView({ block: 'center' });
  }
  window.addEventListener('pagehide', () => sessionStorage.setItem('yy:side-scroll', String(side.scrollTop)));

  onProfile((p) => {
    const stage = statusOf(p)?.stage;
    side.querySelectorAll<HTMLElement>('[data-stage]').forEach((g) => {
      g.querySelector<HTMLElement>('[data-here]')!.hidden = g.dataset.stage !== stage;
    });
  });
}

/* ---- 已读标记 ---- */
const readSet = new Set(store.get<string[]>('yy:read', []));
function paintRead() {
  document.querySelectorAll<HTMLElement>('[data-doc]').forEach((a) => a.classList.toggle('is-read', readSet.has(a.dataset.doc!)));
  document.querySelectorAll<HTMLElement>('[data-read-toggle]').forEach((b) => {
    const on = readSet.has(b.dataset.readToggle!);
    b.setAttribute('aria-pressed', String(on));
    b.textContent = on ? '已读 ✓' : '标为已读';
  });
}
document.querySelectorAll<HTMLElement>('[data-read-toggle]').forEach((b) =>
  b.addEventListener('click', () => {
    const id = b.dataset.readToggle!;
    readSet.has(id) ? readSet.delete(id) : readSet.add(id);
    store.set('yy:read', [...readSet]);
    paintRead();
  }),
);
paintRead();

/* ---- 全部展开 / 收起 ---- */
document.querySelectorAll<HTMLElement>('[data-expand-all]').forEach((b) => {
  const all = () => [...document.querySelectorAll<HTMLDetailsElement>('main details.k')];
  const paint = () => (b.textContent = all().every((d) => d.open) ? '全部收起' : '全部展开');
  b.addEventListener('click', () => {
    const open = !all().every((d) => d.open);
    all().forEach((d) => (d.open = open));
    paint();
  });
  document.addEventListener('toggle', paint, true);
  paint();
});

/* ---- 带锚点进来时，把对应的知识点展开 ---- */
function openTarget() {
  if (!location.hash) return;
  let el: HTMLElement | null = null;
  try {
    el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  } catch {}
  const details = el?.closest('details');
  if (details && !details.open) {
    details.open = true;
    requestAnimationFrame(() => el!.scrollIntoView({ block: 'start' }));
  }
}
openTarget();
window.addEventListener('hashchange', openTarget);

/* ---- 本页目录：高亮当前读到的小节 ---- */
const tocLinks = [...document.querySelectorAll<HTMLAnchorElement>('.toc a')];
if (tocLinks.length) {
  const heads = tocLinks
    .map((a) => document.getElementById(decodeURIComponent(a.hash.slice(1))))
    .filter((h): h is HTMLElement => !!h);
  const spy = () => {
    let active = heads[0];
    for (const h of heads) if (h.getBoundingClientRect().top < 120) active = h;
    tocLinks.forEach((a) => a.classList.toggle('is-active', decodeURIComponent(a.hash.slice(1)) === active?.id));
  };
  document.addEventListener('scroll', spy, { passive: true });
  spy();
}
