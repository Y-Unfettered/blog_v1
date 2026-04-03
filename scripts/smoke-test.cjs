#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const TMP_ROOT = path.join(ROOT_DIR, '.tmp-smoke-test');
const TMP_SEED = path.join(TMP_ROOT, 'seed');
const PORT = Number(process.env.SMOKE_PORT || 3046);
const HOST = '127.0.0.1';
const ADMIN_USERNAME = 'smoke-admin';
const ADMIN_PASSWORD = 'smoke-pass-123';
const JWT_SECRET = 'smoke-secret-key';

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForServer(url, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch (error) {
      // ignore until timeout
    }
    await delay(200);
  }
  throw new Error(`Server did not become ready in ${timeoutMs}ms`);
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${url} failed: ${(data && (data.message || data.error)) || response.status}`);
  }
  return data;
}

async function requestText(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${url} failed: ${response.status}`);
  }
  return text;
}

async function main() {
  fs.rmSync(TMP_ROOT, { recursive: true, force: true });
  fs.mkdirSync(TMP_ROOT, { recursive: true });
  fs.cpSync(path.join(ROOT_DIR, 'data', 'seed'), TMP_SEED, { recursive: true });

  const envBackup = {
    HOST: process.env.HOST,
    PORT: process.env.PORT,
    BLOG_DATA_DIR: process.env.BLOG_DATA_DIR,
    ADMIN_USERNAME: process.env.ADMIN_USERNAME,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    JWT_SECRET: process.env.JWT_SECRET,
  };

  process.env.HOST = HOST;
  process.env.PORT = String(PORT);
  process.env.BLOG_DATA_DIR = path.relative(ROOT_DIR, TMP_SEED).replace(/\\/g, '/');
  process.env.ADMIN_USERNAME = ADMIN_USERNAME;
  process.env.ADMIN_PASSWORD = ADMIN_PASSWORD;
  process.env.JWT_SECRET = JWT_SECRET;

  const serverModulePath = path.join(ROOT_DIR, 'scripts', 'admin-server.cjs');
  delete require.cache[serverModulePath];
  const { server } = require(serverModulePath);

  try {
    await waitForServer(`http://${HOST}:${PORT}/api/posts`);

    const publicPosts = await requestJson(`http://${HOST}:${PORT}/api/posts`);
    const publicSettings = await requestJson(`http://${HOST}:${PORT}/api/settings`);
    const loginHtml = await requestText(`http://${HOST}:${PORT}/admin`);
    const dashboardHtml = await requestText(`http://${HOST}:${PORT}/admin/dashboard`);
    const settingsHtml = await requestText(`http://${HOST}:${PORT}/admin/settings`);
    const editorHtml = await requestText(`http://${HOST}:${PORT}/admin/editor`);
    const graphicsHtml = await requestText(`http://${HOST}:${PORT}/admin/graphics`);
    if (!Array.isArray(publicPosts)) {
      throw new Error('Public posts endpoint did not return an array');
    }
    if (!publicSettings || typeof publicSettings !== 'object' || Array.isArray(publicSettings)) {
      throw new Error('Public settings endpoint did not return an object');
    }
    if (!loginHtml.includes('DevLog Admin Login')) {
      throw new Error('Admin login page did not render the expected title');
    }
    if (!dashboardHtml.includes('DevLog Overview Panel')) {
      throw new Error('Dashboard page did not render the expected title');
    }
    if (!settingsHtml.includes('DevLog Settings')) {
      throw new Error('Settings page did not render the expected title');
    }
    if (!editorHtml.includes('DevLog Post Editor')) {
      throw new Error('Editor page did not render the expected title');
    }
    if (!graphicsHtml.includes('DevLog Graphic Management')) {
      throw new Error('Graphic management page did not render the expected title');
    }

    const login = await requestJson(`http://${HOST}:${PORT}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD }),
    });

    const authHeaders = {
      Authorization: `Bearer ${login.token}`,
      'Content-Type': 'application/json',
    };

    const dashboard = await requestJson(`http://${HOST}:${PORT}/api/data/dashboard`, {
      headers: { Authorization: `Bearer ${login.token}` },
    });
    if (!dashboard.stats || typeof dashboard.stats.totalPosts !== 'number') {
      throw new Error('Dashboard payload missing stats');
    }

    const currentSettings = await requestJson(`http://${HOST}:${PORT}/api/data/settings`, {
      headers: { Authorization: `Bearer ${login.token}` },
    });

    const nextSettings = {
      ...currentSettings,
      siteName: 'Smoke Test Blog',
      markdownTheme: 'github-dark',
      profile: {
        ...(currentSettings.profile || {}),
        name: 'Smoke Tester',
        subtitle: 'Automation',
      },
      about: {
        ...(currentSettings.about || {}),
        title: 'About Smoke',
        skills: [
          { label: 'Testing', icon: 'lucide:test-tube', color: '#22c55e' },
        ],
      },
    };

    await requestJson(`http://${HOST}:${PORT}/api/data/settings`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(nextSettings),
    });

    const savedSettings = await requestJson(`http://${HOST}:${PORT}/api/data/settings`, {
      headers: { Authorization: `Bearer ${login.token}` },
    });
    if (savedSettings.siteName !== 'Smoke Test Blog') {
      throw new Error('Settings update did not persist');
    }
    if (!savedSettings.profile || savedSettings.profile.name !== 'Smoke Tester') {
      throw new Error('Profile payload did not persist');
    }

    const savedNav = await requestJson(`http://${HOST}:${PORT}/api/data/nav`, {
      headers: { Authorization: `Bearer ${login.token}` },
    });

    const savedSections = await requestJson(`http://${HOST}:${PORT}/api/data/sections`, {
      headers: { Authorization: `Bearer ${login.token}` },
    });

    const enabledSectionCount = (Array.isArray(savedSections) ? savedSections : []).filter((item) => item && item.enabled !== false).length;

    if (!Array.isArray(savedNav) || savedNav.length !== enabledSectionCount + 2) {
      throw new Error('Generated navigation did not match enabled sections');
    }
    if (!savedNav.find((item) => item && item.id === 'nav-home') || !savedNav.find((item) => item && item.id === 'nav-about')) {
      throw new Error('Generated navigation missing fixed home/about links');
    }

    const updatedDashboard = await requestJson(`http://${HOST}:${PORT}/api/data/dashboard`, {
      headers: { Authorization: `Bearer ${login.token}` },
    });
    if (updatedDashboard.stats.visibleNavItems !== savedNav.length) {
      throw new Error('Dashboard stats did not reflect generated navigation');
    }

    const createdPost = await requestJson(`http://${HOST}:${PORT}/api/data/posts`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Smoke Test Post',
        slug: 'smoke-test-post',
        sectionId: '1',
        categories: ['1'],
        categoryIds: ['1'],
        categoryId: '1',
        tags: ['1', '2'],
        tagIds: ['1', '2'],
        summary: 'Created by smoke test.',
        cover: '',
        readingTime: 6,
        pinned: false,
        content: '# Smoke Test\n\nInitial content.',
        status: 'draft',
        published: false,
      }),
    });

    const createdPostId = String(createdPost.id || createdPost.postId || createdPost.data && createdPost.data.id || '').trim();
    if (!createdPostId) {
      throw new Error('Post creation did not return an id');
    }

    await requestJson(`http://${HOST}:${PORT}/api/data/posts/${createdPostId}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Smoke Test Post Updated',
        summary: 'Updated by smoke test.',
        pinned: true,
        status: 'published',
        published: true,
        readingTime: 8,
        content: '# Smoke Test\n\nUpdated content.',
      }),
    });

    const savedPost = await requestJson(`http://${HOST}:${PORT}/api/data/posts/${createdPostId}`, {
      headers: { Authorization: `Bearer ${login.token}` },
    });

    if (savedPost.title !== 'Smoke Test Post Updated') {
      throw new Error('Post update did not persist the title');
    }
    if (savedPost.status !== 'published' || savedPost.published !== true) {
      throw new Error('Post update did not persist published status');
    }
    if (savedPost.pinned !== true) {
      throw new Error('Post update did not persist pinned flag');
    }
    if (!Array.isArray(savedPost.tagIds) || savedPost.tagIds.length !== 2) {
      throw new Error('Post save did not persist tag ids');
    }

    const localizedSlugPost = await requestJson(`http://${HOST}:${PORT}/api/data/posts`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: '测试文章',
        slug: '测试文章',
        sectionId: '1',
        categories: ['1'],
        categoryIds: ['1'],
        categoryId: '1',
        summary: 'Slug normalization smoke test.',
        content: '# 测试文章\n\n验证 slug 自动归一化。',
        status: 'draft',
        published: false,
      }),
    });

    const localizedSlugPostId = String(
      localizedSlugPost.id ||
      localizedSlugPost.postId ||
      localizedSlugPost.data && localizedSlugPost.data.id ||
      ''
    ).trim();

    if (!localizedSlugPostId) {
      throw new Error('Localized slug post creation did not return an id');
    }

    const localizedSavedPost = await requestJson(`http://${HOST}:${PORT}/api/data/posts/${localizedSlugPostId}`, {
      headers: { Authorization: `Bearer ${login.token}` },
    });

    if (!localizedSavedPost.slug || !/^[a-z0-9-]+$/.test(localizedSavedPost.slug)) {
      throw new Error('Localized slug was not normalized to an ASCII-safe value');
    }

    const createdGraphic = await requestJson(`http://${HOST}:${PORT}/api/data/graphics`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Smoke Graphic',
        content: 'Graphic smoke content',
        images: ['data:image/png;base64,smoke'],
        sectionId: '1',
        categoryId: '1',
        tagIds: ['1'],
        topics: ['#Smoke'],
        status: 'draft',
        published: false,
      }),
    });

    const createdGraphicId = String(
      createdGraphic.id ||
      createdGraphic.graphicId ||
      createdGraphic.data && createdGraphic.data.id ||
      ''
    ).trim();

    if (!createdGraphicId) {
      throw new Error('Graphic creation did not return an id');
    }

    await requestJson(`http://${HOST}:${PORT}/api/data/graphics/${createdGraphicId}`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({
        title: 'Smoke Graphic Published',
        status: 'published',
        published: true,
        topics: ['#Smoke', '#Published'],
      }),
    });

    const savedGraphic = await requestJson(`http://${HOST}:${PORT}/api/data/graphics/${createdGraphicId}`, {
      headers: { Authorization: `Bearer ${login.token}` },
    });

    if (savedGraphic.title !== 'Smoke Graphic Published') {
      throw new Error('Graphic update did not persist the title');
    }
    if (savedGraphic.status !== 'published' || savedGraphic.published !== true) {
      throw new Error('Graphic update did not persist published status');
    }
    if (!Array.isArray(savedGraphic.images) || savedGraphic.images.length !== 1) {
      throw new Error('Graphic save did not persist images');
    }

    console.log('SMOKE_TEST_OK');
  } catch (error) {
    console.error(`SMOKE_TEST_FAILED: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await new Promise((resolve) => server.close(resolve));
    Object.entries(envBackup).forEach(([key, value]) => {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    });
    fs.rmSync(TMP_ROOT, { recursive: true, force: true });
  }
}

main();
