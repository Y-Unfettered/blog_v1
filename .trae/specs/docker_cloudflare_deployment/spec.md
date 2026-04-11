# 博客项目 Docker + Cloudflare 部署 - Product Requirement Document

## Overview
- **Summary**: 将现有的博客项目部署到 Ubuntu Linux 服务器上，使用 Docker 容器化运行，通过 Cloudflare 提供 CDN 加速和 SSL 证书，绑定域名 lemontop.asia
- **Purpose**: 实现博客项目的生产环境部署，提供稳定、安全、加速的访问体验
- **Target Users**: 博客维护者和访问者

## Goals
- 在 Ubuntu Linux 服务器上使用 Docker Compose 成功部署博客项目
- 配置域名 lemontop.asia 通过 Cloudflare DNS 解析到服务器
- 启用 Cloudflare CDN 加速和免费 SSL 证书
- 确保博客正常运行，包括前端、API 和管理后台
- 实现数据持久化和基本的安全配置

## Non-Goals (Out of Scope)
- 配置额外的反向代理（如 Nginx Proxy Manager、Traefik 等）
- 设置自动备份策略（可以后续添加）
- 配置监控和告警系统（可以后续添加）
- 配置防火墙（ufw 除外的高级防火墙）

## Background & Context
- 项目已有完整的 Docker 配置（docker-compose.yml、Dockerfile.api、Dockerfile.web、nginx.conf）
- 使用 Vue3 + Vite 前端，Node.js API 后端
- 域名：lemontop.asia
- 目标服务器：Ubuntu Linux
- 已有 Cloudflare 账号

## Functional Requirements
- **FR-1**: Docker 和 Docker Compose 在 Ubuntu 服务器上成功安装
- **FR-2**: 项目通过 docker-compose.yml 在服务器上成功启动
- **FR-3**: 域名 lemontop.asia 在 Cloudflare 上配置正确的 DNS 记录
- **FR-4**: Cloudflare CDN 和 SSL 证书启用并正常工作
- **FR-5**: 博客前端、API 和管理后台都可以通过域名正常访问
- **FR-6**: 博客数据持久化存储

## Non-Functional Requirements
- **NFR-1**: 网站通过 HTTPS 访问（Cloudflare SSL）
- **NFR-2**: 首次部署时间不超过 1 小时
- **NFR-3**: Docker 容器配置为自动重启（restart: always）
- **NFR-4**: 环境变量（ADMIN_USERNAME、ADMIN_PASSWORD、JWT_SECRET）安全配置

## Constraints
- **Technical**: 
  - 服务器操作系统：Ubuntu Linux
  - 容器化：Docker + Docker Compose
  - CDN/DNS：Cloudflare
- **Business**: 
  - 域名：lemontop.asia
- **Dependencies**: 
  - 项目现有的 Docker 配置文件
  - Cloudflare 账号
  - 可访问的 Ubuntu 服务器

## Assumptions
- 服务器已安装 Ubuntu 系统并有 root/sudo 权限
- 已有 Cloudflare 账号且域名已添加到 Cloudflare
- 服务器可以访问互联网
- 项目代码已上传到服务器或通过 Git 拉取

## Acceptance Criteria

### AC-1: Docker 环境安装成功
- **Given**: 全新的 Ubuntu 服务器
- **When**: 执行 Docker 和 Docker Compose 安装脚本
- **Then**: docker --version 和 docker-compose --version 命令正常输出版本号
- **Verification**: `programmatic`

### AC-2: 项目通过 Docker Compose 启动
- **Given**: 服务器已安装 Docker 环境，项目文件已上传
- **When**: 执行 docker-compose up -d
- **Then**: 所有容器（blog-web、blog-api）正常运行，docker ps 显示状态为 Up
- **Verification**: `programmatic`

### AC-3: Cloudflare DNS 配置正确
- **Given**: 域名 lemontop.asia 已添加到 Cloudflare
- **When**: 添加 A 记录指向服务器 IP，代理状态为橙色云朵（Proxied）
- **Then**: nslookup lemontop.asia 返回 Cloudflare 的 IP 地址
- **Verification**: `programmatic`

### AC-4: HTTPS 访问正常
- **Given**: Cloudflare SSL 已设置为 Flexible/Full/Full (strict)
- **When**: 通过浏览器访问 https://lemontop.asia
- **Then**: 网站正常加载，浏览器显示安全锁图标
- **Verification**: `human-judgment`

### AC-5: 博客功能完整可用
- **Given**: 网站已成功部署
- **When**: 访问博客首页、文章详情、管理后台等
- **Then**: 所有页面正常加载，功能正常工作
- **Verification**: `human-judgment`

### AC-6: 数据持久化正常
- **Given**: 博客已部署并运行
- **When**: 重启 Docker 容器或服务器
- **Then**: 博客数据（文章、设置等）保持不变
- **Verification**: `programmatic`

## Open Questions
- [ ] Ubuntu 服务器的具体版本（20.04/22.04）
- [ ] 服务器的 IP 地址
- [ ] 是否需要配置自定义的 Nginx 规则（除现有配置外）
