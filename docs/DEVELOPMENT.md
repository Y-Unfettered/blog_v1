# 博客项目开发指南

## 项目概述

这是一个基于 Vue 3 + Node.js 的个人博客项目，采用现代化的开发工具和最佳实践。

## 技术栈

- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite
- **样式**: Tailwind CSS 4.x
- **测试**: Playwright
- **语言**: JavaScript (ES Modules)
- **后端**: Node.js 内置服务器

## 快速开始

### 前置要求

- Node.js 20.x 或更高版本
- npm 或 yarn
- Git

### 安装依赖

```bash
npm install
```

### 初始化数据

```bash
npm run init:data
```

### 启动开发服务器

```bash
# 启动前端开发服务器
npm run dev

# 启动后端管理服务器（新终端）
npm run admin:web
```

访问地址：
- 前端: http://127.0.0.1:5173
- 后端: http://127.0.0.1:3031

## 项目结构

```
my_blog/
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD配置
├── data/
│   └── seed/                   # 数据存储目录
│       ├── posts.json          # 文章数据
│       ├── categories.json     # 分类数据
│       ├── tags.json           # 标签数据
│       ├── settings.json       # 站点设置
│       └── ...
├── docs/
│   └── DEVELOPMENT.md          # 本开发文档
├── dogfood-output/             # Dogfood测试报告
├── performance-logs/           # 性能监控日志
├── scripts/                    # 工具脚本
│   ├── lint-project.cjs        # 代码检查
│   ├── validate-data.cjs       # 数据验证
│   ├── backup-data.cjs         # 数据备份
│   ├── smoke-test.cjs          # 冒烟测试
│   ├── init-data.cjs           # 数据初始化
│   ├── admin-server.cjs        # 管理服务器
│   └── performance-monitor.js  # 性能监控
├── src/                        # 源代码
│   ├── components/             # Vue组件
│   ├── composables/            # Vue组合式函数
│   ├── constants/              # 常量定义
│   ├── services/               # 服务层
│   └── ...
├── tests/                      # 自动化测试
│   ├── frontend.spec.js        # 前端测试
│   ├── backend.spec.js         # 后端测试
│   └── e2e.spec.js             # 端到端测试
├── playwright.config.js        # Playwright配置
├── package.json
└── vite.config.js
```

## 开发工作流

### 1. 代码检查

```bash
npm run lint
```

### 2. 数据验证

```bash
npm run validate:data
```

### 3. 数据备份

```bash
npm run backup:data
```

### 4. 冒烟测试

```bash
npm run smoke:test
```

### 5. 完整检查

```bash
npm run check
```

这个命令会依次执行：
- 代码检查
- 数据验证
- 项目构建
- 冒烟测试

## 自动化测试

### 运行所有测试

```bash
npx playwright test
```

### 运行特定测试

```bash
# 只运行前端测试
npx playwright test tests/frontend.spec.js

# 只运行后端测试
npx playwright test tests/backend.spec.js

# 只运行端到端测试
npx playwright test tests/e2e.spec.js
```

### 查看测试报告

```bash
npx playwright show-report
```

测试报告地址: http://localhost:9323

### 测试覆盖范围

- **后端API测试**: 10个API端点的GET请求测试
- **前端页面测试**: 首页、生活随笔页面、导航链接、响应式设计
- **端到端测试**: 完整用户流程、响应式设计、性能测试

## 性能监控

### 运行性能基准测试

```bash
npm run performance:monitor
```

### 监控内容

- 页面加载时间
- 页面大小
- API响应时间
- HTTP状态码

### 性能基准结果

结果保存在 `performance-logs/benchmarks.json`

## CI/CD流程

### 触发条件

- Push到 main/master 分支
- Pull Request到 main/master 分支
- 手动触发 (workflow_dispatch)

### CI工作流步骤

1. 代码检查 (Lint)
2. 数据验证
3. 项目构建
4. 安装Playwright浏览器
5. 启动测试服务器
6. 运行Playwright测试
7. 上传测试报告
8. (PR时) 部署预览并评论

### 配置文件

CI/CD配置位于 `.github/workflows/ci.yml`

## 数据管理

### 数据文件位置

所有数据存储在 `data/seed/` 目录

### 数据文件

- `posts.json` - 文章内容
- `categories.json` - 分类信息
- `tags.json` - 标签信息
- `settings.json` - 站点设置
- `nav.json` - 导航配置
- `sections.json` - 栏目配置
- `issues.json` - 问题记录
- `tools.json` - 工具分享
- `graphics.json` - 设计创作

### 数据操作

```bash
# 初始化数据
npm run init:data

# 验证数据
npm run validate:data

# 备份数据
npm run backup:data
```

## 常见问题

### Q: 端口被占用怎么办？

A: 修改以下文件中的端口配置：
- 前端: `vite.config.js` (默认5173)
- 后端: `scripts/admin-server.cjs` (默认3031)
- 测试: `playwright.config.js` (baseURL)

### Q: Playwright测试超时？

A: 确保两个服务器都已启动：
```bash
npm run dev
npm run admin:web
```

### Q: 数据验证失败？

A: 检查 `data/seed/` 目录下的JSON文件，确保：
- 所有文章的slug唯一
- 所有引用的ID都存在
- JSON格式正确

### Q: 如何贡献代码？

A: 1. Fork项目
2. 创建特性分支
3. 运行 `npm run check` 确保通过
4. 提交Pull Request

## 最佳实践

### 代码规范

- 遵循 ESLint 规则
- 使用 ES Modules 语法
- 保持代码简洁和可读性

### Git提交

- 清晰的提交信息
- 每次提交一个功能或修复
- 运行测试后再提交

### 测试策略

- 新增功能时添加测试
- 修改代码时更新测试
- 定期运行完整测试

## 联系与支持

如有问题，请提交 Issue 或 Pull Request。

---

**文档版本**: 1.0  
**最后更新**: 2026-04-11
