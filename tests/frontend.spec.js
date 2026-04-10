import { test, expect } from '@playwright/test';

test.describe('前端页面测试', () => {
  test('首页加载测试', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Personal Blog');
    
    // 检查导航栏存在
    const navBar = page.locator('nav');
    await expect(navBar).toBeVisible();
    
    // 检查导航链接
    const navLinks = await page.locator('nav').innerText();
    expect(navLinks).toContain('首页');
    expect(navLinks).toContain('生活随笔');
    expect(navLinks).toContain('技术笔记');
  });

  test('生活随笔页面测试', async ({ page }) => {
    await page.goto('/#/life');
    
    // 检查页面内容
    await page.waitForLoadState('domcontentloaded');
    
    // 检查导航栏仍然存在
    const navBar = page.locator('nav');
    await expect(navBar).toBeVisible();
  });

  test('导航链接测试', async ({ page }) => {
    await page.goto('/');
    
    // 测试导航到生活随笔
    await page.click('text=生活随笔');
    await expect(page.url()).toContain('/#/life');
    
    // 测试导航到首页
    await page.click('text=首页');
    await expect(page.url()).toContain('/#/');
  });

  test('响应式设计测试', async ({ page }) => {
    await page.goto('/');
    
    // 测试桌面视图
    await page.setViewportSize({ width: 1280, height: 800 });
    const navLinks = page.locator('nav');
    await expect(navLinks).toBeVisible();
    
    // 测试移动视图
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('nav')).toBeVisible();
  });
});
