# 文章详情页主标题 clamp 调整

时间：2026-03-09 22:22:44
执行者：Codex

## 本次调整

- 将 `src/views/PostDetailView.vue` 中 `.article-title` 的字号改为 `clamp(1.15rem, 3vw, 2.25rem)`。
- 删除了移动端单独覆盖的标题字号，避免覆盖掉新的 clamp 规则。

## 验证结果

- `npm run lint` 通过
- `npm run build` 通过
