# 编辑器组件识别修复记录

## 问题

后台文章编辑器页面没有显示 `md-editor-v3` 正式编辑器，而是直接落到了备用编辑器。

## 根因

不是 CDN 资源一定失败，也不是编辑器功能被主动移除。

真正原因是 `admin/editor.html` 里识别 `md-editor-v3` UMD 全局导出对象的逻辑写错了：

- 代码只尝试读取：
  - `editorLibrary.MdEditor`
  - `editorLibrary.default.MdEditor`
  - `editorLibrary.default`
- 但 `md-editor-v3@2.11.3` 的 UMD 浏览器导出本身就是组件对象 `window.MdEditorV3`
- 结果组件已经加载成功，代码却把它判成了 `null`
- 随后 `editorReady` 为 `false`，页面就只显示备用编辑器

## 修复

在 `admin/editor.html` 中补上了直接使用 `editorLibrary` 本身作为组件的兜底分支：

- 现在识别顺序变为：
  - `editorLibrary.MdEditor`
  - `editorLibrary.default.MdEditor`
  - `editorLibrary.default`
  - `editorLibrary`

## 结果

修复后，页面会正常进入 `MdEditor` 正式编辑器分支，工具栏、预览、上传入口、保存等原有组件能力会恢复。

备用编辑器保留不变，仅作为真正资源加载失败时的最后降级方案。

## 验证

已执行并通过：

- `npm run lint`
- `npm run smoke:test`
- `npm run build`
