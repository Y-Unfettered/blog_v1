# 后台中英文切换开发记录

## 任务

在后台页面白天/黑夜模式切换按钮旁边新增中英文切换能力，并让正式管理页的主要文案能够随语言切换。

## 本次实现

1. 重写了 `admin/admin-common.js` 的共享壳层能力。
2. 在顶部工具区加入了语言切换按钮 `#admin-locale-toggle`，与主题切换按钮并排显示。
3. 新增 `admin-locale` 本地存储键，支持在 `zh` 和 `en` 之间切换。
4. 为共享壳层加入统一翻译入口：
   - `translate`
   - `translateUiString`
   - `applyLocale`
   - `startLocaleObserver`
5. 页面挂载后会自动翻译：
   - 页头标题、副标题、动作按钮
   - 页面主体中的静态文本节点
   - `placeholder`、`title`、`alt`、`aria-label`
   - 后续通过 `innerHTML` 或框架更新插入的新节点
6. `window.confirm` 和 `layout.setNotice(...)` 已接入翻译层，删除确认框和提示消息会随语言切换。
7. 统一修正了后台共享导航和品牌文案，避免之前共享脚本中的中文乱码继续扩散。

## 当前覆盖范围

- 已覆盖后台共享壳层。
- 已覆盖正式管理页主路径文案：
  - `dashboard`
  - `settings`
  - `tags`
  - `categories`
  - `sections`
  - `posts`
  - `editor`
- 登录页 `admin/index.html` 这次没有接语言切换，因为它不走共享壳层，也没有白天/黑夜切换入口。

## 验证

- `node --check admin/admin-common.js`
- `npm run lint`
- `npm run validate:data`
- `npm run build`
- `npm run smoke:test`

以上命令均已通过。

## 说明

- 这次采用的是“共享壳层 + 自动翻译观察器”的方案，目的不是把每个后台页面都重写一遍，而是先把语言能力收口到公共层，后续新增后台页时只要继续复用 `admin-common.js` 即可。
- 少量非常细碎的技术说明文案如果被 HTML 片段拆得过碎，仍可能存在局部英文残留；后续如果你要继续推进，可以再做一轮“逐页词表补齐”。
