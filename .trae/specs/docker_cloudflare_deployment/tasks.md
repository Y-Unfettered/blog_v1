# 博客项目 Docker + Cloudflare 部署 - The Implementation Plan (Decomposed and Prioritized Task List)

## [ ] Task 1: 准备服务器环境
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 更新 Ubuntu 服务器软件包
  - 安装 Docker 和 Docker Compose
  - 验证 Docker 环境正常工作
- **Acceptance Criteria Addressed**: [AC-1]
- **Test Requirements**:
  - `programmatic` TR-1.1: 执行 `docker --version` 输出版本号
  - `programmatic` TR-1.2: 执行 `docker compose version` 或 `docker-compose --version` 输出版本号
  - `programmatic` TR-1.3: 执行 `docker run hello-world` 成功运行
- **Notes**: 使用官方安装脚本，确保 Docker 和 Docker Compose 版本兼容

## [ ] Task 2: 上传项目文件到服务器
- **Priority**: P0
- **Depends On**: Task 1
- **Description**: 
  - 将项目代码上传到服务器（通过 Git 或 SCP）
  - 确保所有必需文件都在服务器上
- **Acceptance Criteria Addressed**: [AC-2]
- **Test Requirements**:
  - `programmatic` TR-2.1: 服务器上存在 docker-compose.yml 文件
  - `programmatic` TR-2.2: 服务器上存在 deploy/ 目录及其中的 Dockerfile 和 nginx.conf
  - `programmatic` TR-2.3: 服务器上存在 data/ 目录
- **Notes**: 可以使用 `git clone` 或 `scp` 上传文件

## [ ] Task 3: 配置环境变量
- **Priority**: P0
- **Depends On**: Task 2
- **Description**: 
  - 创建 .env 文件
  - 设置 ADMIN_USERNAME、ADMIN_PASSWORD、JWT_SECRET 等环境变量
- **Acceptance Criteria Addressed**: [AC-2, AC-6]
- **Test Requirements**:
  - `programmatic` TR-3.1: .env 文件存在且包含所有必需的环境变量
  - `programmatic` TR-3.2: JWT_SECRET 长度至少 32 个字符
- **Notes**: 使用强密码，妥善保存 .env 文件，不要提交到 Git

## [ ] Task 4: 启动 Docker 容器
- **Priority**: P0
- **Depends On**: Task 3
- **Description**: 
  - 构建并启动 Docker 容器
  - 验证容器正常运行
- **Acceptance Criteria Addressed**: [AC-2, AC-6]
- **Test Requirements**:
  - `programmatic` TR-4.1: 执行 `docker compose up -d --build` 成功
  - `programmatic` TR-4.2: 执行 `docker ps` 显示 blog-web 和 blog-api 容器状态为 Up
  - `programmatic` TR-4.3: 服务器本地可以通过 curl 访问 http://localhost
- **Notes**: 首次构建可能需要较长时间

## [ ] Task 5: 配置 Cloudflare DNS
- **Priority**: P0
- **Depends On**: None（可与 Task 1-4 并行）
- **Description**: 
  - 登录 Cloudflare 账号
  - 添加 A 记录，将 lemontop.asia 指向服务器 IP
  - 确保代理状态为橙色云朵（Proxied）
- **Acceptance Criteria Addressed**: [AC-3]
- **Test Requirements**:
  - `programmatic` TR-5.1: Cloudflare DNS 面板显示正确的 A 记录
  - `programmatic` TR-5.2: 执行 `nslookup lemontop.asia` 返回 Cloudflare IP
- **Notes**: DNS 传播可能需要几分钟到几小时

## [ ] Task 6: 配置 Cloudflare SSL
- **Priority**: P0
- **Depends On**: Task 5
- **Description**: 
  - 在 Cloudflare SSL/TLS 设置中选择合适的模式（Flexible/Full）
  - 确保 Always Use HTTPS 已启用
- **Acceptance Criteria Addressed**: [AC-4]
- **Test Requirements**:
  - `programmatic` TR-6.1: Cloudflare SSL/TLS 模式已设置
  - `human-judgement` TR-6.2: 访问 https://lemontop.asia 显示安全锁
- **Notes**: 建议先使用 Flexible 模式，确认正常后再考虑 Full 模式

## [ ] Task 7: 验证博客功能
- **Priority**: P0
- **Depends On**: Task 4, Task 6
- **Description**: 
  - 通过域名访问博客
  - 测试前端页面、API 和管理后台
- **Acceptance Criteria Addressed**: [AC-4, AC-5]
- **Test Requirements**:
  - `human-judgement` TR-7.1: 博客首页正常加载
  - `human-judgement` TR-7.2: 文章详情页正常显示
  - `human-judgement` TR-7.3: 管理后台可以正常登录和使用
  - `programmatic` TR-7.4: 浏览器控制台无错误
- **Notes**: 测试所有主要功能模块

## [ ] Task 8: 配置防火墙（可选但推荐）
- **Priority**: P1
- **Depends On**: Task 1
- **Description**: 
  - 配置 ufw 防火墙
  - 允许 SSH (22)、HTTP (80)、HTTPS (443) 端口
- **Acceptance Criteria Addressed**: []
- **Test Requirements**:
  - `programmatic` TR-8.1: ufw status 显示防火墙已启用
  - `programmatic` TR-8.2: 必需端口已允许
- **Notes**: 确保不会锁定自己，先允许 SSH 再启用防火墙
