# 数据管理指南

本文档介绍如何管理博客项目的数据，确保数据不会被意外提交到GitHub，同时提供示例数据供快速开始。

## 📁 目录结构

```
my_blog/
├── data/
│   ├── example/          # 示例数据（会被提交到GitHub）
│   │   ├── posts.json
│   │   ├── categories.json
│   │   ├── tags.json
│   │   ├── sections.json
│   │   ├── settings.json
│   │   ├── nav.json
│   │   ├── graphics.json
│   │   ├── tools.json
│   │   └── issues.json
│   └── seed/             # 真实数据（不会被提交到GitHub）
│       ├── posts.json
│       ├── categories.json
│       ├── tags.json
│       ├── sections.json
│       ├── settings.json
│       ├── nav.json
│       ├── graphics.json
│       ├── tools.json
│       └── issues.json
└── backups/               # 数据备份（不会被提交）
```

## 🚀 快速开始

### 1. 初始化数据

首次克隆项目后，使用示例数据初始化：

```bash
npm run setup:data
```

这会将 `data/example/` 中的示例数据复制到 `data/seed/` 目录（跳过已存在的文件）。

### 2. 自定义数据

编辑 `data/seed/` 目录下的JSON文件来添加你的真实数据。

### 3. 启动开发服务器

```bash
npm run dev
npm run admin:web
```

## 📋 数据管理命令

### 设置数据

从示例数据初始化（跳过已存在的文件）：

```bash
npm run setup:data
# 或
node scripts/setup-data.cjs setup
```

### 重置数据

强制从示例数据重置（覆盖所有现有文件）：

```bash
npm run reset:data
# 或
node scripts/setup-data.cjs reset
```

**警告**：这会覆盖 `data/seed/` 中的所有数据，请先备份！

### 备份数据

备份当前数据到 `backups/` 目录：

```bash
npm run backup:data
# 或
node scripts/setup-data.cjs backup
```

备份文件名格式：`data-YYYY-MM-DDTHH-mm-ss.sssZ`

### 查看帮助

```bash
node scripts/setup-data.cjs help
```

## 🔒 Git忽略配置

`.gitignore` 已配置为：

```gitignore
# 真实数据（不提交）
data/seed/*.json
data/*.json

# 示例数据（会提交）
!data/example/

# 其他
backups/
performance-logs/
dogfood-output/
```

**重要**：
- ✅ `data/example/` 会被提交（示例数据）
- ❌ `data/seed/` 不会被提交（你的真实数据）
- ❌ `backups/` 不会被提交（备份文件）

## 📊 数据文件说明

### posts.json
文章数据，包含：
- `id`: 文章ID
- `title`: 标题
- `slug`: URL友好的标识符
- `summary`: 摘要
- `content`: Markdown格式内容
- `categoryIds`: 分类ID列表
- `tagIds`: 标签ID列表
- `status`: 状态（published/draft）
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

### categories.json
分类数据，包含：
- `id`: 分类ID
- `sectionId`: 所属栏目ID
- `name`: 分类名称
- `slug`: URL友好的标识符
- `description`: 描述
- `color`: 颜色
- `icon`: 图标
- `order`: 排序

### tags.json
标签数据，包含：
- `id`: 标签ID
- `name`: 标签名称
- `slug`: URL友好的标识符

### sections.json
栏目数据，包含：
- `id`: 栏目ID
- `name`: 栏目名称
- `slug`: URL友好的标识符
- `url`: 路由路径
- `icon`: 图标
- `color`: 颜色
- `order`: 排序
- `enabled`: 是否启用

### settings.json
站点设置，包含：
- `siteName`: 站点名称
- `siteDescription`: 站点描述
- `siteUrl`: 站点URL
- `author`: 作者
- `email`: 邮箱
- `github`: GitHub链接
- `twitter`: Twitter链接
- `markdownTheme`: Markdown主题
- `profile`: 个人资料
- `about`: 关于页面内容

### nav.json
导航配置，包含：
- `id`: 导航项ID
- `label`: 显示文本
- `url`: 链接地址
- `icon`: 图标
- `order`: 排序
- `visible`: 是否可见

### graphics.json, tools.json, issues.json
其他内容数据，格式类似posts.json。

## 🔄 工作流示例

### 场景1：首次设置

```bash
# 1. 克隆项目
git clone <repo-url>
cd my_blog

# 2. 安装依赖
npm install

# 3. 初始化示例数据
npm run setup:data

# 4. 启动开发服务器
npm run dev
npm run admin:web
```

### 场景2：添加新文章

1. 通过管理后台添加文章，或
2. 直接编辑 `data/seed/posts.json`
3. 数据会自动热重载

### 场景3：备份数据

```bash
# 备份当前数据
npm run backup:data

# 查看备份
ls backups/
```

### 场景4：重置为示例数据

```bash
# 先备份！
npm run backup:data

# 重置数据
npm run reset:data
```

### 场景5：分享项目

```bash
# 1. 确保数据已备份
npm run backup:data

# 2. 提交代码（不会包含真实数据）
git add .
git commit -m "Update"
git push

# 3. 其他人克隆后可以使用示例数据
npm run setup:data
```

## ⚠️ 注意事项

1. **永远不要**手动修改 `data/example/` 中的文件，这些是示例数据
2. **始终**在 `data/seed/` 中编辑你的真实数据
3. **定期**备份数据：`npm run backup:data`
4. **重置前**务必备份：`npm run backup:data`
5. **检查** `.gitignore` 确保真实数据不会被提交

## 🔍 验证数据

运行数据验证确保数据格式正确：

```bash
npm run validate:data
```

## 🆘 常见问题

### Q: 我的数据不见了？

A: 检查 `data/seed/` 目录，数据应该在那里。如果没有，检查备份：

```bash
ls backups/
# 找到最近的备份，复制回 data/seed/
```

### Q: 如何恢复备份？

A:

```bash
# 1. 查看备份
ls backups/

# 2. 复制备份文件到 data/seed/
cp backups/data-<timestamp>/*.json data/seed/
```

### Q: 示例数据可以修改吗？

A: 可以，但建议：
- 如果是改进示例，修改 `data/example/` 并提交
- 如果是个人数据，在 `data/seed/` 中修改

### Q: 如何添加自己的数据？

A: 有两种方式：
1. 使用管理后台（推荐）：启动 `npm run admin:web`
2. 直接编辑 `data/seed/` 中的JSON文件

## 📞 更多帮助

- 查看开发文档：`docs/DEVELOPMENT.md`
- 查看项目README：`README.md`
- 运行数据工具帮助：`node scripts/setup-data.cjs help`
