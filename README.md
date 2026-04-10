# 个人博客项目

## 项目简介

这是一个基于 Vue 3 + Node.js 的个人博客系统，支持前端展示和后台管理功能。

## 技术栈

### 前端技术
- **框架**：Vue 3 (Composition API)
- **构建工具**：Vite
- **样式**：Tailwind CSS
- **Markdown渲染**：marked + highlight.js

### 后端技术
- **运行时**：Node.js
- **Web服务**：原生HTTP模块
- **认证**：JWT (JSON Web Token)
- **数据存储**：JSON文件（本地存储）

### 部署技术
- **容器化**：Docker + Docker Compose
- **Web服务器**：Nginx

## 目录结构

```
my_blog/
├── admin/                  # 后台管理页面
├── src/                    # 前端源代码
│   ├── components/         # Vue组件
│   ├── App.vue             # 主应用组件
│   └── main.js             # 入口文件
├── scripts/                # 后端脚本
│   ├── admin-server.cjs    # API服务器
│   ├── init-data.cjs       # 数据初始化脚本
│   └── setup-data.cjs      # 数据管理工具
├── data/
│   ├── example/            # 示例数据（会提交到Git）
│   └── seed/               # 真实数据（不会提交到Git）
├── docs/                   # 文档
│   ├── DEVELOPMENT.md      # 开发指南
│   └── DATA_MANAGEMENT.md # 数据管理指南
├── deploy/                 # Docker配置
│   ├── Dockerfile.api      # API容器配置
│   ├── Dockerfile.web      # 前端容器配置
│   └── nginx.conf          # Nginx配置
├── docker-compose.yml      # 生产环境配置
├── docker-compose.dev.yml  # 开发环境配置
├── .env                    # 环境变量配置
├── package.json            # 项目依赖
└── README.md               # 项目说明
```

## 开发环境搭建

### 1. 安装依赖

```bash
npm install
```

### 1.1 配置环境变量

```bash
cp .env.example .env
```

请在 `.env` 中配置以下关键项：
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `JWT_SECRET`

### 2. 初始化数据

首次使用时，从示例数据初始化：

```bash
npm run setup:data
```

这会将 `data/example/` 中的示例数据复制到 `data/seed/` 目录。

**数据管理命令：**
- `npm run setup:data` - 设置数据（跳过已存在的文件）
- `npm run reset:data` - 重置为示例数据（覆盖所有文件）
- `npm run backup:data` - 备份当前数据

详细说明请查看 [数据管理指南](docs/DATA_MANAGEMENT.md)。

### 3. 启动前端开发服务器

```bash
npm run dev
```

前端服务器将在 http://127.0.0.1:5173/ 启动。

### 4. 启动后台API服务器

```bash
npm run admin:web
```

后台API服务器将在 http://127.0.0.1:3030/admin 启动。

## 生产环境部署

### 1. 构建和启动容器

```bash
docker-compose up -d
```

### 2. 访问博客

- 前端：http://localhost
- 后台管理：http://localhost/admin

## 登录信息

后台登录账号和密码由 `.env` 决定：
- 用户名：`ADMIN_USERNAME`
- 密码：`ADMIN_PASSWORD`

## 数据管理

### 重要说明

- **`data/example/`** - 示例数据（会提交到Git）
- **`data/seed/`** - 真实数据（不会提交到Git）
- **`backups/`** - 数据备份（不会提交到Git）

### 数据文件

所有数据存储在 `data/seed/` 目录中，包括：
- `posts.json` - 文章数据
- `categories.json` - 分类数据
- `tags.json` - 标签数据
- `sections.json` - 栏目数据
- `nav.json` - 导航数据
- `settings.json` - 站点设置
- `graphics.json` - 设计创作
- `issues.json` - 问题记录
- `tools.json` - 工具分享

### 快速命令

```bash
# 初始化示例数据
npm run setup:data

# 重置为示例数据（覆盖所有文件）
npm run reset:data

# 备份当前数据
npm run backup:data

# 验证数据
npm run validate:data
```

详细说明请查看 [数据管理指南](docs/DATA_MANAGEMENT.md)。

## 文档

- [开发指南](docs/DEVELOPMENT.md) - 详细的开发环境搭建和工作流说明
- [数据管理指南](docs/DATA_MANAGEMENT.md) - 数据管理和Git忽略配置说明

## 注意事项

1. 生产环境部署前，请修改 `.env` 文件中的配置
2. 定期备份数据：`npm run backup:data`
3. 后台登录密码应在生产环境中修改
4. 真实数据存储在 `data/seed/`，不会被提交到Git
5. 示例数据存储在 `data/example/`，会被提交到Git

## 许可证

MIT
