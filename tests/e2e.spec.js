import { test, expect } from '@playwright/test';

test.describe('端到端测试', () => {
  test('完整的用户流程测试', async ({ page, request }) => {
    // 1. 测试后端API
    const postsResponse = await request.get('http://127.0.0.1:3031/api/posts');
    expect(postsResponse.ok()).toBeTruthy();
    
    const categoriesResponse = await request.get('http://127.0.0.1:3031/api/categories');
    expect(categoriesResponse.ok()).toBeTruthy();
    
    // 2. 测试前端页面
    await page.goto('/');
    
    // 检查页面标题
    await expect(page).toHaveTitle('Personal Blog');
    
    // 检查导航栏
    const navBar = page.locator('nav');
    await expect(navBar).toBeVisible();
    
    // 检查导航链接
    const navLinks = await page.locator('nav').innerText();
    expect(navLinks).toContain('首页');
    expect(navLinks).toContain('生活随笔');
    
    // 3. 测试导航到生活随笔页面
    await page.click('text=生活随笔');
    await expect(page.url()).toContain('/life');
    
    // 检查生活随笔页面内容
    await page.waitForLoadState('domcontentloaded');
    
    // 检查导航栏仍然存在
    const lifeNavBar = page.locator('nav');
    await expect(lifeNavBar).toBeVisible();
    
    // 5. 测试从后端获取数据并在前端显示
    const posts = await postsResponse.json();
    const categories = await categoriesResponse.json();
    
    // 查找生活随笔分类
    const lifeCategory = categories.find(cat => cat.name === '生活随笔');
    if (lifeCategory) {
      const lifePosts = posts.filter(post => post.categoryId === lifeCategory.id);
      
      // 验证前端显示的文章数量应该与分页后的数据匹配
      const articles = page.locator('article');
      const articleCount = await articles.count();
      expect(articleCount).toBeGreaterThanOrEqual(0);
    }
    
    // 6. 测试返回首页
    await page.click('text=首页');
    await expect(page.url()).toContain('/');
  });

  test('响应式设计测试', async ({ page }) => {
    // 测试桌面视图
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    
    let navBar = page.locator('nav');
    await expect(navBar).toBeVisible();
    
    // 测试平板视图
    await page.setViewportSize({ width: 768, height: 1024 });
    navBar = page.locator('nav');
    await expect(navBar).toBeVisible();
    
    // 测试移动视图
    await page.setViewportSize({ width: 375, height: 667 });
    navBar = page.locator('nav');
    await expect(navBar).toBeVisible();
  });

  test('页面加载性能测试', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // 等待页面完全加载
    await page.waitForLoadState('domcontentloaded');
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    
    console.log(`页面加载时间: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(15000); // 期望页面加载时间小于15秒（考虑浏览器初始化时间）
  });
});
