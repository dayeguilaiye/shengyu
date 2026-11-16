import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://yunyu.hitnrun.cn',
  integrations: [mdx()],
  devToolbar: { enabled: false },
  server: { port: 4321 },
});
