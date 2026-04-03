# 文章详情地址结构调整记录

时间：2026-03-09 15:44:28

## 本次目标

根据最新需求，前台文章详情地址不再使用 `#/post/文章slug`，改为：

- `#/栏目slug/分类slug?id=文章ID`

示例：

- `#/design/ai-art?id=1`

这样地址表达的是“文章属于哪个栏目、哪个分类”，具体文章再通过 `id` 定位，避免标题或中文别名直接暴露到前台地址。

## 本次改动

### 1. 前台路由改为按文章 ID 定位详情

- 更新 `src/composables/useBlogRouting.js`
- 详情页状态由原来的 `activeSlug` 改为 `activePostId`
- 点击文章后，生成的新地址结构为 `#/栏目slug/分类slug?id=文章ID`
- 旧的 `#/post/...` 链接保留兼容，不会立刻失效

### 2. 前台数据层接入 sections

- 更新 `src/services/blogApi.js`
- 更新 `src/composables/useBlogData.js`
- 前台现在会额外读取 `/api/sections`
- 这样生成文章详情地址时，可以直接使用栏目 slug，而不是再从旧文章 slug 里猜

### 3. 文章详情与栏目归属改为优先基于 section/category 元数据

- 更新 `src/utils/blog.js`
- 新增栏目标准化、文章主分类解析、文章所属栏目解析、详情地址生成等公共方法

- 更新 `src/composables/useBlogComputedState.js`
- 设计页、栏目页、详情上一篇/下一篇，不再单纯依赖旧的 `post.slug` 前缀判断栏目
- 现在优先基于 `sectionId + categoryId/categories` 计算文章归属

### 4. 后台编辑器补充前台地址预览

- 更新 `admin/editor.html`
- 保留内部 `slug` 展示
- 新增 `Public route` 预览，直接告诉后台当前文章最终会生成什么前台地址

### 5. 旧 article 页面跳转逻辑同步更新

- 更新 `article.html`
- 旧入口页现在会根据文章 `id + 栏目/分类` 重定向到新的详情地址
- 如果只拿到旧 slug 参数，仍会跳到兼容的旧 hash 路径

## 验证结果

已执行并通过：

- `npm run lint`
- `npm run build`
- `npm run smoke:test`
- `npm run validate:data`

## 当前说明

本次改动已经完成前后台代码和兼容入口调整，但还没有做浏览器人工点透回归。

建议人工确认：

- 首页打开文章后地址是否变成 `#/栏目/分类?id=ID`
- 栏目页打开文章后是否正常进入详情
- 刷新详情页后是否还能正确定位文章
- 旧 `#/post/...` 链接是否仍能打开
