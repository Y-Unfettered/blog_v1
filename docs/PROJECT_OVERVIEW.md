# 项目概览

## 项目简介

这是一个基于 Vue 3 + Node.js 的个人博客系统，采用现代化的技术栈和架构设计，支持前端展示和后台管理功能。

**主要特点：**
- 🎨 现代化的深色主题设计
- 📱 响应式布局，支持桌面、平板和移动设备
- 🔧 完整的后台管理系统
- 📊 数据管理和备份功能
- 🚀 性能优化，页面加载快速
- 🔒 安全的用户认证
- 📦 容器化部署支持
- 🧪 完整的自动化测试
- 🔄 CI/CD 集成

## 技术栈

### 前端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | 3.x | 前端框架 |
| Vite | 6.x | 构建工具 |
| Tailwind CSS | 4.x | 样式框架 |
| @iconify/vue | 5.x | 图标库 |
| marked | 12.x | Markdown 渲染 |
| highlight.js | 11.x | 代码高亮 |

### 后端技术

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 20.x | 运行时 |
| JWT | 9.x | 用户认证 |
| bcrypt | 6.x | 密码加密 |

### 测试技术

| 技术 | 版本 | 用途 |
|------|------|------|
| Playwright | 1.59.x | 端到端测试 |
| ESLint | 9.x | 代码检查 |

### 部署技术

| 技术 | 版本 | 用途 |
|------|------|------|
| Docker | 20.x+ | 容器化 |
| Docker Compose | 2.x | 容器编排 |
| Nginx | 1.25.x | Web 服务器 |

## 项目架构

### 目录结构

```
my_blog/
├── admin/                  # 后台管理页面
├── src/                    # 前端源代码
│   ├── components/         # Vue 组件
│   ├── composables/        # 组合式函数
│   ├── constants/          # 常量定义
│   ├── services/           # 服务层
│   ├── utils/              # 工具函数
│   ├── views/              # 页面组件
│   ├── App.vue             # 主应用组件
│   ├── main.js             # 入口文件
│   └── index.css           # 全局样式
├── scripts/                # 后端脚本
│   ├── admin-server.cjs    # API 服务器
│   ├── setup-data.cjs      # 数据管理工具
│   └── ...                 # 其他脚本
├── data/                   # 数据目录
│   ├── example/            # 示例数据（会提交到 Git）
│   └── seed/               # 真实数据（不会提交到 Git）
├── docs/                   # 文档
├── deploy/                 # Docker 配置
├── tests/                  # 自动化测试
├── .github/                # GitHub 配置
├── .env.example            # 环境变量示例
├── package.json            # 项目依赖
└── README.md               # 项目说明
```

### 数据流

```
API → useBlogData → useBlogComputedState → 组件
```

1. **API 层**：从 `data/seed/` 读取数据，提供 RESTful API
2. **数据管理**：`useBlogData` 组合式函数管理原始数据
3. **计算状态**：`useBlogComputedState` 提供计算后的数据
4. **组件**：接收计算后的数据并渲染界面

### 核心模块

#### 1. 数据管理
- **useBlogData**：管理所有数据的加载和更新
- **useBlogComputedState**：提供计算后的状态，如分页、过滤等
- **useBlogRouting**：处理路由和导航逻辑

#### 2. 页面组件
- **HomeView**：首页，展示文章列表和轮播图
- **LifeView**：生活随笔页面
- **ColumnView**：技术笔记等栏目页面
- **PostDetailView**：文章详情页
- **AboutView**：关于页面
- **DesignView**：设计创作页面

#### 3. 后台管理
- **文章管理**：创建、编辑、删除文章
- **分类管理**：管理文章分类
- **标签管理**：管理文章标签
- **设置管理**：管理站点设置
- **导航管理**：管理导航菜单

## 开发流程

### 1. 环境搭建

```bash
# 克隆项目
git clone <repo-url>
cd my_blog

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件

# 初始化数据
npm run setup:data

# 启动开发服务器
npm run dev           # 前端
npm run admin:web     # 后台 API
```

### 2. 开发规范

#### 代码规范
- 使用 ESLint 检查代码质量
- 遵循 Vue 3 Composition API 最佳实践
- 组件命名采用 PascalCase
- 文件命名采用 kebab-case

#### 提交规范
- 提交信息清晰明了
- 功能开发完成后运行 `npm run check`
- 确保测试通过后再提交

### 3. 测试

```bash
# 运行所有测试
npx playwright test

# 运行特定测试
npx playwright test tests/frontend.spec.js
npx playwright test tests/backend.spec.js
npx playwright test tests/e2e.spec.js

# 查看测试报告
npx playwright show-report
```

### 4. 部署

#### 开发环境

```bash
docker-compose -f docker-compose.dev.yml up -d
```

#### 生产环境

```bash
docker-compose up -d
```

## 数据管理

### 数据文件

所有数据存储在 `data/seed/` 目录：

- `posts.json` - 文章数据
- `categories.json` - 分类数据
- `tags.json` - 标签数据
- `sections.json` - 栏目数据
- `nav.json` - 导航数据
- `settings.json` - 站点设置
- `graphics.json` - 设计创作
- `issues.json` - 问题记录
- `tools.json` - 工具分享

### 数据命令

```bash
# 初始化示例数据
npm run setup:data

# 重置为示例数据
npm run reset:data

# 备份当前数据
npm run backup:data

# 验证数据
npm run validate:data
```

## 性能优化

### 前端优化
- 代码分割和按需加载
- 图片懒加载
- 资源压缩
- 预加载关键资源
- 缓存策略

### 后端优化
- API 响应时间 < 200ms
- 数据查询优化
- 并发处理
- 缓存机制

### 性能监控

```bash
# 运行性能监控
npm run performance:monitor
```

## 安全措施

### 认证安全
- JWT 令牌认证
- 密码 bcrypt 加密
- 环境变量管理敏感信息

### 输入验证
- 所有用户输入进行验证
- 防止 XSS 攻击
- 防止 CSRF 攻击

### 部署安全
- HTTPS 配置
- 防火墙设置
- 访问控制
- 日志监控

## 扩展性

### 功能扩展
- 搜索功能
- 访问统计
- 邮件订阅
- 社交分享
- 多语言支持
- PWA 支持

### 技术扩展
- 数据库集成（如 MongoDB、PostgreSQL）
- 云存储集成
- CDN 集成
- 第三方服务集成

## 维护与支持

### 常见问题

**Q: 数据丢失怎么办？**
A: 查看 `backups/` 目录，找到最近的备份并恢复。

**Q: 部署失败怎么办？**
A: 检查 Docker 日志，确保环境变量配置正确。

**Q: 性能下降怎么办？**
A: 运行 `npm run performance:monitor` 分析性能瓶颈。

### 支持渠道
- 项目文档：`docs/` 目录
- GitHub Issues：提交问题和建议
- 代码审查：Pull Request

## 贡献指南

1. **Fork 项目**
2. **创建分支**：`git checkout -b feature/your-feature`
3. **开发功能**
4. **运行测试**：`npm run check`
5. **提交代码**：`git commit -m "Add your feature"`
6. **推送分支**：`git push origin feature/your-feature`
7. **创建 Pull Request**

## 版本管理

### 版本策略
- **主版本**：重大功能变更
- **次版本**：新功能和改进
- **补丁版本**：bug 修复和小改进

### 发布流程
1. 更新版本号
2. 运行测试
3. 构建项目
4. 部署到测试环境
5. 验证功能
6. 部署到生产环境
7. 发布版本

## 许可证

MIT License

## 致谢

- Vue 3 团队
- Tailwind CSS 团队
- Playwright 团队
- 所有贡献者

## 联系信息

- 项目地址：<GitHub 仓库地址>
- 文档地址：`docs/` 目录
- 问题反馈：GitHub Issues

---

**项目状态：** 生产就绪  
**最后更新：** 2026-04-11  
**版本：** 1.1.0
