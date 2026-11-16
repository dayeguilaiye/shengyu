/**
 * 由标题算出稳定的锚点 id。
 * Point / Issue 组件和知识点索引都用它，所以两边的链接能对上。
 * 改标题会改 id；调整顺序不会。
 */
export function anchorId(title: string): string {
  let h = 5381;
  for (const ch of title) h = ((h << 5) + h + ch.codePointAt(0)!) >>> 0;
  return 'k' + h.toString(36);
}
