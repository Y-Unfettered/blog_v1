# 路由历史模式修复 - 验证清单

- [ ] 检查 normalizeNavHref 函数是否返回历史模式路径
- [ ] 检查 isNavActive 函数是否正确检查历史模式URL
- [ ] 检查 setColumnViewByPath 函数是否正确处理历史模式路径
- [ ] 验证 Vite 开发服务器配置了 historyApiFallback
- [ ] 验证生产环境 Nginx 配置了 SPA 回退规则
- [ ] 测试首页点击设计导航项是否跳转到 /design 并正确显示
- [ ] 测试在其他页面点击首页导航项是否正确跳转
- [ ] 测试刷新任意页面是否不再出现 File not found 错误
- [ ] 测试所有导航项点击是否正确跳转
- [ ] 测试所有页面是否正确显示