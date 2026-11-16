# 部署

站点地址为 https://yunyu.hitnrun.cn，运行在现有腾讯云 k3s 服务器上。Traefik 提供入口，cert-manager 的 `lets-encrypt` ClusterIssuer 管理证书。应用使用独立的 `yunyu` namespace。

## 自动发布

PR 执行 npm 锁文件安装、Astro 构建、页面与搜索索引校验、Helm lint 和脚本语法检查。推送到 `main` 或在 `main` 手动运行 workflow，会继续发布 GHCR 镜像并部署。

验证阶段上传 `dist/` artifact，镜像阶段直接使用该产物。镜像按提交 SHA 标记，部署按不可变 digest 选择版本。`version.json` 记录提交 SHA，线上检查验证页面、搜索索引、静态资源、404 和版本。

同一分支发布串行执行，部署前检查当前提交仍为最新 `main`。Helm 3 使用 `--atomic --timeout 5m`，升级失败时回滚。Helm 成功后的 HTTPS 检查失败会将工作流标红，需要排查并按下文回滚。

## 首次配置

1. 创建公开仓库 `dayeguilaiye/yunyu`，将本地项目关联至该仓库。
2. DNS A 记录 `yunyu.hitnrun.cn` 指向 `43.136.135.35`。
3. 在已登录 GitHub CLI 且能通过 SSH 访问服务器的本机运行：

```bash
bash deploy/bootstrap.sh tengxun 43.136.135.35
```

脚本创建 namespace、部署 ServiceAccount 和 namespace 范围的 RBAC，将 kubeconfig 经 SSH 与标准输入写入仓库 Secret `YUNYU_KUBECONFIG`。凭据不写入代码库、不输出到终端。

4. 推送 `main`，触发第一次构建。GHCR 新包默认为私有；首次镜像发布后，将 `yunyu` 包设置为 Public，再重跑失败的部署 job。工作流会先验证镜像可匿名拉取。
5. 确认工作流成功，检查站点 HTTPS 和证书状态。

服务器需要允许 GitHub 托管 runner 访问 Kubernetes API 的 6443 端口。现有 SSH 管理权限已检查；runner 到集群的实际连通性在首次 Action 部署时验证。

## 本地验证

使用 Node.js 24 和 Helm 3：

```bash
npm ci
npm run build
node scripts/check-dist.mjs
helm lint deploy/yunyu --set image.digest=sha256:check
bash -n deploy/bootstrap.sh scripts/smoke.sh
```

Dockerfile 接收已构建的 `dist/`。Nginx 以非 root 用户运行并监听 8080；HTML 与搜索索引重新验证缓存，带哈希的 `/_astro/` 资源长期缓存。用户数据保存在浏览器 localStorage，应用部署不需要持久卷。

## 排查和回滚

```bash
ssh tengxun 'kubectl -n yunyu get pods,certificate; helm history yunyu -n yunyu'
ssh tengxun 'kubectl -n yunyu logs deploy/yunyu'
ssh tengxun 'helm rollback yunyu REVISION -n yunyu --wait --timeout 5m'
bash scripts/smoke.sh https://yunyu.hitnrun.cn EXPECTED_COMMIT_SHA
```

将 `REVISION` 替换为目标 Helm revision，将 `EXPECTED_COMMIT_SHA` 替换为对应提交 SHA。
