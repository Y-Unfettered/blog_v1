# 博客项目 Docker + Cloudflare 部署 - Verification Checklist

## 服务器环境验证
- [ ] Ubuntu 服务器已更新到最新软件包
- [ ] Docker 已成功安装，`docker --version` 输出版本号
- [ ] Docker Compose 已成功安装，`docker compose version` 输出版本号
- [ ] `docker run hello-world` 测试通过

## 项目文件验证
- [ ] 项目代码已完整上传到服务器
- [ ] docker-compose.yml 文件存在
- [ ] deploy/Dockerfile.api 存在
- [ ] deploy/Dockerfile.web 存在
- [ ] deploy/nginx.conf 存在
- [ ] data/ 目录存在且包含所需数据文件

## 环境变量验证
- [ ] .env 文件已创建
- [ ] ADMIN_USERNAME 已设置
- [ ] ADMIN_PASSWORD 已设置且为强密码
- [ ] JWT_SECRET 已设置且长度至少 32 个字符
- [ ] .env 文件已添加到 .gitignore（如有需要）

## Docker 容器验证
- [ ] `docker compose up -d --build` 执行成功
- [ ] `docker ps` 显示 blog-web 容器状态为 Up
- [ ] `docker ps` 显示 blog-api 容器状态为 Up
- [ ] 服务器本地可以通过 curl 访问 http://localhost
- [ ] Docker 容器日志无错误

## Cloudflare DNS 验证
- [ ] lemontop.asia 已添加到 Cloudflare 账号
- [ ] A 记录已创建，指向服务器 IP
- [ ] 代理状态为橙色云朵（Proxied）
- [ ] `nslookup lemontop.asia` 返回 Cloudflare IP 地址

## Cloudflare SSL 验证
- [ ] SSL/TLS 模式已设置（推荐先使用 Flexible）
- [ ] Always Use HTTPS 已启用
- [ ] 访问 http://lemontop.asia 自动跳转到 HTTPS
- [ ] 浏览器访问 https://lemontop.asia 显示安全锁图标

## 博客功能验证
- [ ] 博客首页正常加载
- [ ] 导航菜单正常工作
- [ ] 文章列表正常显示
- [ ] 文章详情页正常加载
- [ ] 管理后台登录页面正常显示
- [ ] 可以成功登录管理后台
- [ ] 管理后台功能正常可用
- [ ] 浏览器控制台无 JavaScript 错误

## 数据持久化验证
- [ ] 重启 Docker 容器后数据保持不变
- [ ] 重启服务器后数据保持不变
- [ ] blog-data 卷正确挂载

## 安全配置验证（可选）
- [ ] ufw 防火墙已启用
- [ ] SSH (22) 端口已允许
- [ ] HTTP (80) 端口已允许
- [ ] HTTPS (443) 端口已允许
- [ ] 其他不必要的端口已关闭
