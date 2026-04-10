import { test, expect } from '@playwright/test';

test.describe('后端API测试', () => {
  test('获取文章列表', async ({ request }) => {
    const response = await request.get('http://127.0.0.1:3031/api/posts');
    expect(response.ok()).toBeTruthy();
    
    const posts = await response.json();
    expect(Array.isArray(posts)).toBeTruthy();
    
    if (posts.length > 0) {
      const firstPost = posts[0];
      expect(firstPost).toHaveProperty('id');
      expect(firstPost).toHaveProperty('title');
      expect(firstPost).toHaveProperty('createdAt');
    }
  });

  test('获取分类列表', async ({ request }) => {
    const response = await request.get('http://127.0.0.1:3031/api/categories');
    expect(response.ok()).toBeTruthy();
    
    const categories = await response.json();
    expect(Array.isArray(categories)).toBeTruthy();
    
    if (categories.length > 0) {
      const firstCategory = categories[0];
      expect(firstCategory).toHaveProperty('id');
      expect(firstCategory).toHaveProperty('name');
    }
  });

  test('获取标签列表', async ({ request }) => {
    const response = await request.get('http://127.0.0.1:3031/api/tags');
    expect(response.ok()).toBeTruthy();
    
    const tags = await response.json();
    expect(Array.isArray(tags)).toBeTruthy();
    
    if (tags.length > 0) {
      const firstTag = tags[0];
      expect(firstTag).toHaveProperty('id');
      expect(firstTag).toHaveProperty('name');
    }
  });

  test('获取导航列表', async ({ request }) => {
    const response = await request.get('http://127.0.0.1:3031/api/nav');
    expect(response.ok()).toBeTruthy();
    
    const navItems = await response.json();
    expect(Array.isArray(navItems)).toBeTruthy();
    
    if (navItems.length > 0) {
      const firstNavItem = navItems[0];
      expect(firstNavItem).toHaveProperty('id');
      expect(firstNavItem).toHaveProperty('label');
      expect(firstNavItem).toHaveProperty('href');
    }
  });

  test('获取设置', async ({ request }) => {
    const response = await request.get('http://127.0.0.1:3031/api/settings');
    expect(response.ok()).toBeTruthy();
    
    const settings = await response.json();
    expect(typeof settings).toBe('object');
    expect(settings).not.toBeNull();
  });

  test('获取章节列表', async ({ request }) => {
    const response = await request.get('http://127.0.0.1:3031/api/sections');
    expect(response.ok()).toBeTruthy();
    
    const sections = await response.json();
    expect(Array.isArray(sections)).toBeTruthy();
    
    if (sections.length > 0) {
      const firstSection = sections[0];
      expect(firstSection).toHaveProperty('id');
      expect(firstSection).toHaveProperty('name');
    }
  });

  test('获取工具列表', async ({ request }) => {
    const response = await request.get('http://127.0.0.1:3031/api/tools');
    expect(response.ok()).toBeTruthy();
    
    const tools = await response.json();
    expect(Array.isArray(tools)).toBeTruthy();
    
    if (tools.length > 0) {
      const firstTool = tools[0];
      expect(firstTool).toHaveProperty('id');
      expect(firstTool).toHaveProperty('name');
    }
  });

  test('获取问题列表', async ({ request }) => {
    const response = await request.get('http://127.0.0.1:3031/api/issues');
    expect(response.ok()).toBeTruthy();
    
    const issues = await response.json();
    expect(Array.isArray(issues)).toBeTruthy();
    
    if (issues.length > 0) {
      const firstIssue = issues[0];
      expect(firstIssue).toHaveProperty('id');
      expect(firstIssue).toHaveProperty('title');
    }
  });

  test('获取图形列表', async ({ request }) => {
    const response = await request.get('http://127.0.0.1:3031/api/graphics');
    expect(response.ok()).toBeTruthy();
    
    const graphics = await response.json();
    expect(Array.isArray(graphics)).toBeTruthy();
    
    if (graphics.length > 0) {
      const firstGraphic = graphics[0];
      expect(firstGraphic).toHaveProperty('id');
      expect(firstGraphic).toHaveProperty('title');
    }
  });

  test('测试404错误处理', async ({ request }) => {
    const response = await request.get('http://127.0.0.1:3031/api/nonexistent');
    expect(response.status()).toBe(404);
    
    const error = await response.json();
    expect(error).toHaveProperty('error');
    expect(error).toHaveProperty('message');
  });
});
