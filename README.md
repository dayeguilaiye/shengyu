# 生育手册

从备孕到孩子三岁要知道的事，按时间和按专题两条线整理。纯前端静态站。

## 运行

```bash
npm install
```

```bash
npm run dev
```

打开 http://localhost:4321 。

生成可部署的静态文件（输出到 `dist/`）：

```bash
npm run build
```

## 改内容

每一页是 `src/content/docs/` 下的一个 `.mdx` 文件。还没写的页面也已经建好文件，里面列着提纲，在网站的“内容计划”页能看到全部进度。

内容的组织方式、写法和各种约定都在 [CLAUDE.md](CLAUDE.md)。让 Claude 改的时候，说清是哪一页、要做什么就行，比如“把 `prep/supplements` 填上”或“在待产包里加一项”。

## 数据

读者的设置和勾选只存在浏览器的 localStorage 里，换设备不会同步，也不会上传到任何地方。

## 部署

站点部署到 https://shengyu.hitnrun.cn。GitHub Actions 验证构建后发布镜像，并通过 Helm 更新 k3s。首次配置和回滚步骤见 [部署说明](docs/deployment.md)。
