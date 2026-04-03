# 文章数据重置记录

时间：2026-03-09 16:09:46

## 本次处理

本次已清空原有正式文章数据，并按当前站点结构重新生成演示文章：

- 栏目数：5
- 分类数：50
- 每个分类文章数：2
- 新文章总数：100

## 数据结果

新的文章数据已写入：

- `data/seed/posts.json`

重建规则：

- 每个分类固定生成 2 篇文章
- 文章均为 `published`
- `sectionId / categoryId / categoryIds / tags / tagIds` 均与当前后台模型对齐
- `slug` 使用 `栏目slug/分类slug/post-1|post-2`
- 每个栏目下第一个分类的第 1 篇文章会标记为 `pinned`

## 备份

旧文章数据已备份到：

- `CodeTrash/posts.json.pre-reset-20260309-160320`

## 辅助脚本

为了避免终端直写造成中文编码污染，新增了正式重建脚本：

- `scripts/reset-posts-by-category.cjs`

后续如果还要再次重置演示文章，可以直接运行：

```bash
node scripts/reset-posts-by-category.cjs
```

## 验证结果

已执行并通过：

- `npm run validate:data`
- `npm run smoke:test`
- `npm run build`

补充确认：

- 50 个分类全部校验为“每类 2 篇文章”
- 新文章总数为 100

## 说明

使用 `Get-Content` 在当前 Windows 控制台里查看 `posts.json` 时，可能会看到乱码，这是控制台编码显示问题；实际文件内容为正常 UTF-8，Node 读取结果已确认正常。
