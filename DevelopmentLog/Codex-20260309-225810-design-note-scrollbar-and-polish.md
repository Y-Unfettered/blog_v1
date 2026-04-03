# 设计弹层滚动条隐藏与样式润色

时间：2026-03-09 22:58:10
执行者：Codex

## 本次改动

- 调整了 `src/components/DesignNoteModal.vue` 的弹层视觉细节。
- 隐藏了右侧内容滚动区的可见滚动条。
- 隐藏了下方缩略图横向滚动条，并补全 `scrollbar-width` / `-ms-overflow-style` 兼容。
- 给右侧信息面板增加了更干净的渐变层次和顶部/底部过渡遮罩。
- 微调了底部操作区、关闭按钮、主图片区和关注按钮的质感。

## 验证结果

- `npm run lint` 通过
- `npm run build` 通过
