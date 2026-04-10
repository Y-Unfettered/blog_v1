# 路由历史模式修复 - 实现计划

## [ ] 任务 1：修复 normalizeNavHref 函数
- **优先级**：P0
- **依赖**：None
- **描述**：修改 `normalizeNavHref` 函数，使其返回历史模式的路径，而不是哈希模式的路径。
- **验收标准**：AC-1, AC-2, AC-4
- **测试要求**：
  - `human-judgment` TR-1.1：验证导航链接是否使用历史模式路径
  - `human-judgment` TR-1.2：验证点击导航项是否正确跳转
- **备注**：函数位于 `src/utils/blog.js` 文件中

## [ ] 任务 2：修复 isNavActive 函数
- **优先级**：P0
- **依赖**：任务 1
- **描述**：修改 `isNavActive` 函数，使其正确检查历史模式的URL，而不是哈希模式的URL。
- **验收标准**：AC-2, AC-4
- **测试要求**：
  - `human-judgment` TR-2.1：验证导航项的 active 状态是否正确
  - `human-judgment` TR-2.2：验证点击首页是否正确响应
- **备注**：函数位于 `src/composables/useBlogRouting.js` 文件中

## [ ] 任务 3：修复 setColumnViewByPath 函数
- **优先级**：P0
- **依赖**：任务 1
- **描述**：确保 `setColumnViewByPath` 函数正确处理历史模式的路径，特别是在处理栏目页面时。
- **验收标准**：AC-1, AC-4
- **测试要求**：
  - `human-judgment` TR-3.1：验证设计页面是否正确显示
  - `human-judgment` TR-3.2：验证其他栏目页面是否正确显示
- **备注**：函数位于 `src/composables/useBlogRouting.js` 文件中

## [ ] 任务 4：验证 Vite 开发服务器配置
- **优先级**：P1
- **依赖**：None
- **描述**：确保 Vite 开发服务器配置了正确的 historyApiFallback 设置，以解决刷新404问题。
- **验收标准**：AC-3
- **测试要求**：
  - `human-judgment` TR-4.1：验证刷新页面是否不再出现404错误
- **备注**：配置文件位于 `vite.config.js` 文件中

## [ ] 任务 5：验证生产环境 Nginx 配置
- **优先级**：P1
- **依赖**：None
- **描述**：确保生产环境的 Nginx 配置正确设置了 SPA 回退规则，以解决刷新404问题。
- **验收标准**：AC-3
- **测试要求**：
  - `human-judgment` TR-5.1：验证生产环境中刷新页面是否不再出现404错误
- **备注**：配置文件位于 `deploy/nginx.conf` 文件中

## [ ] 任务 6：测试所有页面导航
- **优先级**：P1
- **依赖**：任务 1, 任务 2, 任务 3
- **描述**：测试所有页面的导航功能，确保在历史模式下正常工作。
- **验收标准**：AC-1, AC-2, AC-4
- **测试要求**：
  - `human-judgment` TR-6.1：验证所有导航项点击是否正确跳转
  - `human-judgment` TR-6.2：验证所有页面是否正确显示
- **备注**：需要测试首页、设计、工具、问题、生活等所有页面