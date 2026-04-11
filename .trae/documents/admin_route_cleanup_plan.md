# 后台访问路径清理计划

## 问题分析

当前博客部署后，后台可以通过两个路径访问：
- `https://lemontop.asia/admin/`
- `https://admin.lemontop.asia/admin/`

这是因为：
1. Nginx 配置文件中的 `server_name` 设置为 `localhost`，会响应所有域名请求
2. 任何访问 `/admin/` 路径的请求都会被代理到 `blog-api` 服务
3. Cloudflare 可能同时配置了 `lemontop.asia` 和 `admin.lemontop.asia` 的 A 记录

## 解决方案

### 方案 1：修改 Nginx 配置
- 将 `server_name` 从 `localhost` 改为 `lemontop.asia`
- 这样只有主域名的请求会被处理，`admin.lemontop.asia` 的请求将不会匹配

### 方案 2：修改 Cloudflare DNS 配置
- 只保留 `lemontop.asia` 的 A 记录，删除 `admin.lemontop.asia` 的记录
- 这样 `admin.lemontop.asia` 就不会解析到服务器

### 推荐方案
**方案 1** - 修改 Nginx 配置，因为：
- 更直接控制访问路径
- 即使 Cloudflare 配置了多个域名，也能确保只有主域名的后台路径可访问
- 符合最小修改原则

## 实施步骤

### 步骤 1：修改 Nginx 配置文件
- 编辑 `deploy/nginx.conf` 文件
- 将 `server_name localhost;` 改为 `server_name lemontop.asia;`

### 步骤 2：重新构建和部署
- 执行 `docker compose up -d --build` 重新构建和启动容器
- 验证修改是否生效

### 步骤 3：测试验证
- 访问 `https://lemontop.asia/admin/` 确认后台可正常访问
- 访问 `https://admin.lemontop.asia/admin/` 确认无法访问（或返回 404）

## 潜在风险

- **风险 1**：修改后可能影响其他子域名的访问
  - 缓解：如果需要保留其他子域名，需要在 Nginx 配置中添加对应的 `server` 块

- **风险 2**：DNS 缓存可能导致修改后需要一段时间才能生效
  - 缓解：等待 DNS 缓存刷新（通常几分钟到几小时）

## 预期结果

- 只有 `https://lemontop.asia/admin/` 可以访问后台
- `https://admin.lemontop.asia/admin/` 将无法访问（或返回 404）
- 其他功能正常运行
