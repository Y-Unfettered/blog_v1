# 回收站说明

本目录用于暂存本次整理中判定为“高置信度冗余”的代码文件，方便后续确认后再决定是否彻底删除。

## 本次移动原则

- 保留当前正在使用的正式页面
- 只移动备份文件、历史试验页和未接入的补丁文件
- 对仍可能被引用的文件暂不处理

## 已移动文件分类

### 1. 备份文件

- `categories.html.bak`
- `dashboard.html.bak`
- `editor.html.bak`
- `editor.html.bak2`
- `posts.html.bak`
- `settings.html.bak`
- `tags.html.bak`

### 2. 历史试验入口页

- `index-v2.html`
- `index-new.html`
- `index-single.html`

### 3. 未接入补丁文件

- `pagination-fix.js`

说明：`pagination-fix.js` 文件注释已经明确说明其内容应合并到旧试验页 `index-single.html` 中，因此一并归档。
