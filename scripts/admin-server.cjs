#!/usr/bin/env node
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const HOST = process.env.HOST || '0.0.0.0';
const PORT = Number(process.env.PORT || 3030);
const BLOG_DATA_DIR = process.env.BLOG_DATA_DIR || 'data/seed';

function requireEnv(name) {
  const value = String(process.env[name] || '').trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const JWT_SECRET = requireEnv('JWT_SECRET');
const ADMIN_USER = {
  username: requireEnv('ADMIN_USERNAME'),
  password: requireEnv('ADMIN_PASSWORD'),
};

const PUBLIC_DATA_PATHS = new Map([
  ['/api/posts', 'posts'],
  ['/api/categories', 'categories'],
  ['/api/tags', 'tags'],
  ['/api/nav', 'nav'],
  ['/api/settings', 'settings'],
  ['/api/sections', 'sections'],
  ['/api/tools', 'tools'],
  ['/api/issues', 'issues'],
  ['/api/graphics', 'graphics'],
]);

const sseClients = new Set();

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end(body);
}

function readJsonFile(filePath, fallbackValue) {
  if (!fs.existsSync(filePath)) {
    return fallbackValue;
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  if (!raw.trim()) {
    return fallbackValue;
  }
  return JSON.parse(raw);
}

function writeJsonFile(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

async function readRequestJson(req) {
  const body = await readRequestBody(req);
  if (!body.trim()) {
    return {};
  }
  return JSON.parse(body);
}

function dataFilePath(dataType) {
  return path.join(__dirname, '..', BLOG_DATA_DIR, `${dataType}.json`);
}

function getFallbackValue(dataType) {
  return dataType === 'settings' ? {} : [];
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function buildSlug(value, fallback) {
  const slug = String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || fallback;
}

function normalizeNavHref(value) {
  let href = String(value || '').trim();
  if (!href) {
    return '';
  }
  if (/^https?:\/\//i.test(href)) {
    return href;
  }
  if (!href.startsWith('#')) {
    href = href.startsWith('/') ? `#${href}` : `#/${href}`;
  }
  return href;
}

function navHrefToUrl(value) {
  const href = normalizeNavHref(value);
  if (!href) {
    return '';
  }
  if (/^https?:\/\//i.test(href)) {
    return href;
  }
  const raw = href.startsWith('#') ? href.slice(1) : href;
  return raw || '/';
}

function formatDateString(date) {
  return date.toISOString().slice(0, 10);
}

function parseIdList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item || '').trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
  if (value === null || value === undefined || value === '') {
    return [];
  }
  return [String(value).trim()].filter(Boolean);
}

function readCollectionData(dataType) {
  const data = readJsonFile(dataFilePath(dataType), getFallbackValue(dataType));
  return Array.isArray(data) ? data : [];
}

function readObjectData(dataType) {
  const data = readJsonFile(dataFilePath(dataType), getFallbackValue(dataType));
  return data && typeof data === 'object' && !Array.isArray(data) ? data : {};
}

function nextNumericId(collection) {
  const numericIds = collection
    .map((item) => Number(item && item.id))
    .filter((value) => Number.isFinite(value));
  if (numericIds.length === 0) {
    return null;
  }
  return String(Math.max(...numericIds) + 1);
}

function generateItemId(collection, prefix) {
  return nextNumericId(collection) || `${prefix}-${Date.now()}`;
}

function getNextOrder(collection) {
  const orders = collection
    .map((item) => Number(item && item.order))
    .filter((value) => Number.isFinite(value));
  return orders.length ? Math.max(...orders) + 1 : 1;
}

function normalizeNamedItemPayload(dataType, payload, current = {}, collection = []) {
  const next = { ...current, ...payload };

  if (!next.id) {
    next.id = generateItemId(collection, dataType.slice(0, -1) || 'item');
  }

  if (typeof next.name === 'string') {
    next.name = next.name.trim();
  }
  if (typeof next.label === 'string') {
    next.label = next.label.trim();
  }

  if (!isNonEmptyString(next.slug) && isNonEmptyString(next.name)) {
    next.slug = buildSlug(next.name, `${dataType}-${next.id}`);
  }

  if (!Number.isFinite(Number(next.order))) {
    next.order = current.order ?? getNextOrder(collection);
  } else {
    next.order = Number(next.order);
  }

  if (dataType === 'sections' || dataType === 'nav') {
    if (!isNonEmptyString(next.url) && isNonEmptyString(next.slug)) {
      next.url = `/${next.slug}`;
    }
    if (typeof next.enabled !== 'boolean') {
      next.enabled = current.enabled ?? true;
    }
  }

  if (dataType === 'nav') {
    if (!isNonEmptyString(next.label) && isNonEmptyString(next.name)) {
      next.label = next.name;
    }
    if (!isNonEmptyString(next.name) && isNonEmptyString(next.label)) {
      next.name = next.label;
    }

    const href = normalizeNavHref(next.href || next.url);
    if (href) {
      next.href = href;
      next.url = navHrefToUrl(href);
    }

    if (typeof next.visible !== 'boolean') {
      next.visible = current.visible ?? current.enabled ?? true;
    }
    if (typeof next.enabled !== 'boolean') {
      next.enabled = current.enabled ?? next.visible;
    }
  }

  if (dataType === 'tools') {
    if (typeof next.category === 'string') {
      next.category = next.category.trim();
    }
    if (typeof next.type === 'string') {
      next.type = next.type.trim();
    }
    if (typeof next.description === 'string') {
      next.description = next.description.trim();
    }
    if (typeof next.url === 'string') {
      next.url = next.url.trim();
    }
    if (typeof next.icon === 'string') {
      next.icon = next.icon.trim();
    }
    if (typeof next.color === 'string') {
      next.color = next.color.trim();
    }
    if (typeof next.enabled !== 'boolean') {
      next.enabled = current.enabled ?? true;
    }
    if (!next.updatedAt) {
      next.updatedAt = formatDateString(new Date());
    }
  }

  return next;
}

function normalizeSettingsPayload(payload, current = {}) {
  const next = { ...current, ...payload };

  if (!isNonEmptyString(next.siteName) && isNonEmptyString(next.blogName)) {
    next.siteName = next.blogName.trim();
  }
  if (!isNonEmptyString(next.description) && isNonEmptyString(next.blogDesc)) {
    next.description = next.blogDesc.trim();
  }

  if (typeof next.siteName === 'string') {
    next.siteName = next.siteName.trim();
  }
  if (typeof next.description === 'string') {
    next.description = next.description.trim();
  }
  if (typeof next.blogName === 'string') {
    next.blogName = next.blogName.trim();
  }
  if (typeof next.blogDesc === 'string') {
    next.blogDesc = next.blogDesc.trim();
  }
  if (typeof next.metaKeywords === 'string') {
    next.metaKeywords = next.metaKeywords.trim();
  }
  if (typeof next.metaDescription === 'string') {
    next.metaDescription = next.metaDescription.trim();
  }
  if (typeof next.markdownTheme === 'string') {
    next.markdownTheme = next.markdownTheme.trim();
  }

  if (next.profile && typeof next.profile === 'object' && !Array.isArray(next.profile)) {
    next.profile = { ...(current.profile || {}), ...next.profile };
    ['name', 'subtitle', 'motto', 'avatar', 'github', 'planet', 'email'].forEach((key) => {
      if (typeof next.profile[key] === 'string') {
        next.profile[key] = next.profile[key].trim();
      }
    });
  }

  if (next.about && typeof next.about === 'object' && !Array.isArray(next.about)) {
    next.about = { ...(current.about || {}), ...next.about };
    ['title', 'content', 'skillsTitle'].forEach((key) => {
      if (typeof next.about[key] === 'string') {
        next.about[key] = next.about[key].trim();
      }
    });
    if (Array.isArray(next.about.skills)) {
      next.about.skills = next.about.skills
        .map((skill) => ({
          label: String(skill && skill.label || '').trim(),
          icon: String(skill && skill.icon || '').trim(),
          color: String(skill && skill.color || '').trim(),
        }))
        .filter((skill) => skill.label);
    }
  }

  if (next.postsPerPage !== undefined) {
    const postsPerPage = Number(next.postsPerPage);
    if (Number.isFinite(postsPerPage) && postsPerPage > 0) {
      next.postsPerPage = Math.floor(postsPerPage);
    } else {
      delete next.postsPerPage;
    }
  }

  return next;
}

function normalizePostPayload(payload, current = {}, collection = []) {
  const next = { ...current, ...payload };
  const now = new Date();

  if (!next.id) {
    next.id = generateItemId(collection, 'post');
  }

  if (typeof next.title === 'string') {
    next.title = next.title.trim();
  }
  if (typeof next.summary === 'string') {
    next.summary = next.summary.trim();
  }
  if (typeof next.slug === 'string') {
    next.slug = next.slug.trim();
  }

  const slugFallback = buildSlug(next.title, `post-${next.id}`);
  if (next.slug !== undefined) {
    next.slug = buildSlug(next.slug, slugFallback);
  }

  if (!isNonEmptyString(next.slug) && slugFallback) {
    next.slug = slugFallback;
  }

  const categoryIds = parseIdList(
    next.categories !== undefined
      ? next.categories
      : (next.categoryIds !== undefined ? next.categoryIds : next.categoryId),
  );
  next.categories = categoryIds;
  next.categoryIds = categoryIds;
  next.categoryId = categoryIds[0] || '';

  const tagIds = parseIdList(next.tags !== undefined ? next.tags : next.tagIds);
  next.tags = tagIds;
  next.tagIds = tagIds;

  if (!isNonEmptyString(next.createdAt)) {
    next.createdAt = current.createdAt || now.toISOString();
  }
  next.updatedAt = now.toISOString();

  if (!isNonEmptyString(next.created_at)) {
    next.created_at = current.created_at || formatDateString(new Date(next.createdAt));
  }
  next.updated_at = formatDateString(now);

  if (!isNonEmptyString(next.summary)) {
    next.summary = current.summary || '';
  }

  if (!isNonEmptyString(next.status)) {
    next.status = next.published ? 'published' : 'draft';
  }
  next.status = next.status === 'published' ? 'published' : 'draft';
  next.published = next.status === 'published';

  if (next.readingTime !== undefined) {
    const readingTime = Number(next.readingTime);
    if (Number.isFinite(readingTime) && readingTime > 0) {
      next.readingTime = Math.ceil(readingTime);
    } else {
      delete next.readingTime;
    }
  }

  return next;
}

function normalizeGraphicPayload(payload, current = {}, collection = []) {
  const next = { ...current, ...payload };
  const now = new Date();

  if (!next.id) {
    next.id = generateItemId(collection, 'graphic');
  }

  if (typeof next.title === 'string') {
    next.title = next.title.trim();
  }
  if (typeof next.summary === 'string') {
    next.summary = next.summary.trim();
  }
  if (typeof next.content === 'string') {
    next.content = next.content.trim();
  }
  if (!isNonEmptyString(next.content) && isNonEmptyString(next.body)) {
    next.content = String(next.body).trim();
  }
  if (typeof next.slug === 'string') {
    next.slug = next.slug.trim();
  }

  next.images = Array.isArray(next.images)
    ? next.images.map((item) => String(item || '').trim()).filter(Boolean)
    : [];

  if (!isNonEmptyString(next.cover) && next.images.length > 0) {
    next.cover = next.images[0];
  }
  if (isNonEmptyString(next.cover) && next.images.length === 0) {
    next.images = [String(next.cover).trim()];
  }

  next.topics = parseIdList(next.topics)
    .map((item) => (item.startsWith('#') ? item : `#${item}`))
    .slice(0, 18);

  next.tagIds = parseIdList(next.tagIds !== undefined ? next.tagIds : next.tags);
  next.tags = next.tagIds;
  next.sectionId = isNonEmptyString(next.sectionId) ? String(next.sectionId).trim() : '';
  next.categoryId = isNonEmptyString(next.categoryId) ? String(next.categoryId).trim() : '';

  const slugFallback = buildSlug(next.title, `graphic-${next.id}`);
  if (next.slug !== undefined) {
    next.slug = buildSlug(next.slug, slugFallback);
  }
  if (!isNonEmptyString(next.slug)) {
    next.slug = slugFallback;
  }

  if (!isNonEmptyString(next.summary) && isNonEmptyString(next.content)) {
    next.summary = String(next.content)
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120);
  }

  if (!isNonEmptyString(next.createdAt)) {
    next.createdAt = current.createdAt || now.toISOString();
  }
  next.updatedAt = now.toISOString();

  if (!isNonEmptyString(next.created_at)) {
    next.created_at = current.created_at || formatDateString(new Date(next.createdAt));
  }
  next.updated_at = formatDateString(now);

  if (!isNonEmptyString(next.status)) {
    next.status = next.published ? 'published' : 'draft';
  }
  next.status = next.status === 'published' ? 'published' : 'draft';
  next.published = next.status === 'published';

  return next;
}

function resolvePostDate(post) {
  const candidates = [
    post.updatedAt,
    post.createdAt,
    post.updated_at,
    post.created_at,
  ];

  for (const value of candidates) {
    const date = new Date(value || '');
    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return new Date(0);
}

function buildWeeklyActivity(posts) {
  const labels = [];
  const counts = new Map();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const key = formatDateString(date);
    labels.push(key);
    counts.set(key, 0);
  }

  posts.forEach((post) => {
    const date = resolvePostDate(post);
    const key = formatDateString(date);
    if (counts.has(key)) {
      counts.set(key, counts.get(key) + 1);
    }
  });

  return labels.map((key) => ({
    date: key,
    count: counts.get(key) || 0,
  }));
}

function buildNavigationItems() {
  const sections = readCollectionData('sections')
    .filter((section) => section && section.enabled !== false)
    .slice()
    .sort((left, right) => {
      const orderDiff = (Number(left.order) || 0) - (Number(right.order) || 0);
      if (orderDiff !== 0) {
        return orderDiff;
      }
      return String(left.name || left.label || left.slug || left.id || '').localeCompare(
        String(right.name || right.label || right.slug || right.id || ''),
        'zh-CN',
      );
    });

  const items = [
    {
      id: 'nav-home',
      label: '首页',
      name: '首页',
      href: '#/',
      url: '/',
      cover: '',
      visible: true,
      enabled: true,
      order: 1,
      type: 'system',
      systemKey: 'home',
    },
  ];

  sections.forEach((section, index) => {
    const label = String(section.name || section.label || section.slug || section.id || '').trim();
    const href = normalizeNavHref(section.url || section.slug || '');
    if (!label || !href) {
      return;
    }

    items.push({
      id: `nav-section-${section.id}`,
      label,
      name: label,
      href,
      url: navHrefToUrl(href),
      cover: String(section.cover || '').trim(),
      visible: true,
      enabled: true,
      order: index + 2,
      type: 'section',
      sectionId: String(section.id),
    });
  });

  items.push({
    id: 'nav-about',
    label: '关于我',
    name: '关于我',
    href: '#/about',
    url: '/about',
    cover: '',
    visible: true,
    enabled: true,
    order: items.length + 1,
    type: 'system',
    systemKey: 'about',
  });

  return items;
}

function buildDashboardPayload() {
  const posts = readCollectionData('posts');
  const categories = readCollectionData('categories');
  const tags = readCollectionData('tags');
  const sections = readCollectionData('sections');
  const navItems = buildNavigationItems();
  const settings = readObjectData('settings');

  const publishedPosts = posts.filter((post) => {
    const status = String(post && post.status ? post.status : '').trim();
    return status === 'published' || post.published === true;
  });
  const draftPosts = posts.filter((post) => !publishedPosts.includes(post));
  const pinnedPosts = posts.filter((post) => post && post.pinned);
  const visibleNavItems = navItems.filter((item) => item && item.enabled !== false && item.visible !== false);

  const categoryNameMap = new Map(
    categories.map((item) => [String(item && item.id), String(item && (item.name || item.label) || '').trim()]),
  );

  const categoryUsage = new Map();
  posts.forEach((post) => {
    parseIdList(
      post && post.categories !== undefined
        ? post.categories
        : (post && post.categoryIds !== undefined ? post.categoryIds : post && post.categoryId),
    ).forEach((id) => {
      categoryUsage.set(id, (categoryUsage.get(id) || 0) + 1);
    });
  });

  const topCategories = categories
    .map((item) => ({
      id: item.id,
      name: String(item.name || item.label || item.id || '').trim(),
      count: categoryUsage.get(String(item.id)) || 0,
    }))
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.name.localeCompare(b.name, 'zh-CN');
    })
    .slice(0, 5);

  const recentPosts = posts
    .slice()
    .sort((a, b) => resolvePostDate(b) - resolvePostDate(a))
    .slice(0, 6)
    .map((post) => {
      const categoryIds = parseIdList(
        post.categories !== undefined
          ? post.categories
          : (post.categoryIds !== undefined ? post.categoryIds : post.categoryId),
      );

      return {
        id: post.id,
        title: post.title || 'Untitled',
        slug: post.slug || '',
        status: post.status || (post.published ? 'published' : 'draft'),
        pinned: Boolean(post.pinned),
        updatedAt: resolvePostDate(post).toISOString(),
        categories: categoryIds.map((id) => categoryNameMap.get(String(id)) || id),
      };
    });

  const memoryUsage = process.memoryUsage();
  const uptimeSeconds = Math.max(0, Math.floor(process.uptime()));

  return {
    generatedAt: new Date().toISOString(),
    stats: {
      totalPosts: posts.length,
      publishedPosts: publishedPosts.length,
      draftPosts: draftPosts.length,
      pinnedPosts: pinnedPosts.length,
      totalCategories: categories.length,
      totalTags: tags.length,
      totalSections: sections.length,
      totalNavItems: navItems.length,
      visibleNavItems: visibleNavItems.length,
    },
    weeklyActivity: buildWeeklyActivity(posts),
    topCategories,
    recentPosts,
    site: {
      siteName: settings.siteName || settings.blogName || '',
      author: settings.author || settings.profile?.name || '',
      markdownTheme: settings.markdownTheme || 'default',
    },
    system: {
      nodeVersion: process.version,
      uptimeSeconds,
      startedAt: new Date(Date.now() - (uptimeSeconds * 1000)).toISOString(),
      dataDir: BLOG_DATA_DIR,
      rssMb: Math.round((memoryUsage.rss / 1024 / 1024) * 10) / 10,
      heapUsedMb: Math.round((memoryUsage.heapUsed / 1024 / 1024) * 10) / 10,
    },
  };
}

function normalizeItemPayload(dataType, payload, current = {}, collection = []) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error('Payload must be an object.');
  }

  if (dataType === 'settings') {
    return normalizeSettingsPayload(payload, current);
  }

  if (dataType === 'posts') {
    return normalizePostPayload(payload, current, collection);
  }

  if (dataType === 'graphics') {
    return normalizeGraphicPayload(payload, current, collection);
  }

  return normalizeNamedItemPayload(dataType, payload, current, collection);
}

function generateToken(username) {
  return jwt.sign(
    {
      username,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
    },
    JWT_SECRET,
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

async function verifyPassword(password, expected) {
  if (!expected) {
    return false;
  }
  if (expected.startsWith('$2a$') || expected.startsWith('$2b$') || expected.startsWith('$2y$')) {
    return bcrypt.compare(password, expected);
  }
  return password === expected;
}

function requireAuth(req, res) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const decoded = verifyToken(token);
  if (!decoded) {
    sendJson(res, 401, { error: 'Unauthorized', message: 'Unauthorized or expired token.' });
    return null;
  }
  return decoded;
}

function addSseClient(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  res.write(': connected\n\n');

  const client = { res };
  const keepAliveTimer = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch (error) {
      clearInterval(keepAliveTimer);
      sseClients.delete(client);
    }
  }, 25000);

  client.keepAliveTimer = keepAliveTimer;
  sseClients.add(client);

  req.on('close', () => {
    clearInterval(keepAliveTimer);
    sseClients.delete(client);
  });
}

function broadcastDataChange(dataType, action, id) {
  if (sseClients.size === 0) {
    return;
  }

  const payload = JSON.stringify({
    dataType,
    action,
    id: id || null,
    timestamp: new Date().toISOString(),
  });

  for (const client of sseClients) {
    try {
      client.res.write(`event: data-change\n`);
      client.res.write(`data: ${payload}\n\n`);
    } catch (error) {
      clearInterval(client.keepAliveTimer);
      sseClients.delete(client);
    }
  }
}

async function handleLogin(req, res) {
  try {
    const { username, password } = await readRequestJson(req);
    const isValidUser = username === ADMIN_USER.username;
    const isValidPassword = isValidUser
      ? await verifyPassword(String(password || ''), ADMIN_USER.password)
      : false;

    if (!isValidUser || !isValidPassword) {
      sendJson(res, 401, { error: 'Invalid credentials', message: 'Invalid username or password.' });
      return;
    }

    sendJson(res, 200, { token: generateToken(username) });
  } catch (error) {
    sendJson(res, 400, { error: 'Bad request', message: 'Invalid login payload.' });
  }
}

async function handleCollectionRequest(req, res, dataType, dataFile) {
  const fallbackValue = getFallbackValue(dataType);

  if (dataType === 'nav') {
    if (req.method === 'GET') {
      sendJson(res, 200, buildNavigationItems());
      return;
    }

    sendJson(res, 405, {
      error: 'Method not allowed',
      message: 'Navigation is generated from enabled sections and cannot be edited directly.',
    });
    return;
  }

  if (req.method === 'GET') {
    try {
      const data = readJsonFile(dataFile, fallbackValue);
      sendJson(res, 200, data);
    } catch (error) {
      sendJson(res, 500, { error: 'Read failed', message: 'Failed to read data.' });
    }
    return;
  }

  if (req.method === 'POST') {
    try {
      const payload = await readRequestJson(req);
      const collection = readJsonFile(dataFile, []);
      if (!Array.isArray(collection)) {
        sendJson(res, 405, { error: 'Method not allowed', message: 'This data type does not support item creation.' });
        return;
      }

      const created = normalizeItemPayload(dataType, payload, {}, collection);
      if (collection.some((item) => String(item && item.id) === String(created.id))) {
        created.id = generateItemId(collection, dataType.slice(0, -1) || 'item');
      }

      collection.push(created);
      writeJsonFile(dataFile, collection);
      broadcastDataChange(dataType, 'create', created.id);
      sendJson(res, 201, {
        success: true,
        id: created.id,
        postId: created.id,
        data: created,
      });
    } catch (error) {
      sendJson(res, 400, { error: 'Bad request', message: error.message || 'Invalid request body.' });
    }
    return;
  }

  if (req.method === 'PUT') {
    try {
      const payload = await readRequestJson(req);
      const current = readJsonFile(dataFile, fallbackValue);

      let next;
      if (dataType === 'settings') {
        next = normalizeSettingsPayload(payload, current);
      } else if (Array.isArray(current)) {
        if (!Array.isArray(payload)) {
          throw new Error('Payload must be an array.');
        }
        next = payload.map((item, index) => {
          const currentItem = current.find((entry) => String(entry && entry.id) === String(item && item.id));
          const normalized = normalizeItemPayload(dataType, item, currentItem || {}, current);
          if (!Number.isFinite(Number(normalized.order))) {
            normalized.order = index + 1;
          }
          return normalized;
        });
      } else {
        next = payload;
      }

      writeJsonFile(dataFile, next);
      broadcastDataChange(dataType, 'replace', null);
      sendJson(res, 200, { success: true, data: next });
    } catch (error) {
      sendJson(res, 400, { error: 'Bad request', message: error.message || 'Invalid request body.' });
    }
    return;
  }

  sendJson(res, 405, { error: 'Method not allowed', message: 'Unsupported method.' });
}

async function handleItemRequest(req, res, dataType, dataId, dataFile) {
  if (dataType === 'nav') {
    sendJson(res, 405, {
      error: 'Method not allowed',
      message: 'Navigation is generated from enabled sections and cannot be edited directly.',
    });
    return;
  }

  if (!fs.existsSync(dataFile)) {
    sendJson(res, 404, { error: 'Not found', message: 'Data file does not exist.' });
    return;
  }

  let collection;
  try {
    collection = readJsonFile(dataFile, []);
  } catch (error) {
    sendJson(res, 500, { error: 'Read failed', message: 'Failed to read data.' });
    return;
  }

  if (!Array.isArray(collection)) {
    sendJson(res, 400, { error: 'Bad request', message: 'This data type does not support item-based operations.' });
    return;
  }

  const itemIndex = collection.findIndex((item) => String(item && item.id) === String(dataId));

  if (req.method === 'GET') {
    if (itemIndex < 0) {
      sendJson(res, 404, { error: 'Not found', message: 'Data item does not exist.' });
      return;
    }
    sendJson(res, 200, collection[itemIndex]);
    return;
  }

  if (req.method === 'DELETE') {
    if (itemIndex < 0) {
      sendJson(res, 404, { error: 'Not found', message: 'Data item does not exist.' });
      return;
    }

    collection.splice(itemIndex, 1);
    writeJsonFile(dataFile, collection);
    broadcastDataChange(dataType, 'delete', dataId);
    sendJson(res, 200, { success: true });
    return;
  }

  if (req.method === 'PATCH' || req.method === 'PUT') {
    if (itemIndex < 0) {
      sendJson(res, 404, { error: 'Not found', message: 'Data item does not exist.' });
      return;
    }

    try {
      const payload = await readRequestJson(req);
      const current = collection[itemIndex] || {};
      const next = normalizeItemPayload(dataType, payload, current, collection);
      next.id = current.id;
      collection[itemIndex] = next;

      writeJsonFile(dataFile, collection);
      broadcastDataChange(dataType, 'update', next.id);
      sendJson(res, 200, { success: true, data: next });
    } catch (error) {
      sendJson(res, 400, { error: 'Bad request', message: error.message || 'Invalid request body.' });
    }
    return;
  }

  sendJson(res, 405, { error: 'Method not allowed', message: 'Unsupported method.' });
}

async function handleDataRequest(req, res, pathname) {
  const segments = pathname.split('/').filter(Boolean);
  const dataType = segments[2];
  const rawDataId = segments.length > 3 ? segments.slice(3).join('/') : '';
  const dataId = rawDataId ? decodeURIComponent(rawDataId) : '';

  if (!dataType) {
    sendJson(res, 400, { error: 'Bad request', message: 'Data type is required.' });
    return;
  }

  const dataFile = dataFilePath(dataType);

  if (!dataId) {
    await handleCollectionRequest(req, res, dataType, dataFile);
    return;
  }

  await handleItemRequest(req, res, dataType, dataId, dataFile);
}

async function handleApiRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (pathname === '/api/events' && req.method === 'GET') {
    addSseClient(req, res);
    return;
  }

  if (pathname === '/api/login' && req.method === 'POST') {
    await handleLogin(req, res);
    return;
  }

  if (PUBLIC_DATA_PATHS.has(pathname) && req.method === 'GET') {
    const dataType = PUBLIC_DATA_PATHS.get(pathname);
    if (dataType === 'nav') {
      sendJson(res, 200, buildNavigationItems());
      return;
    }

    const dataFile = dataFilePath(dataType);
    try {
      const data = readJsonFile(dataFile, getFallbackValue(dataType));
      sendJson(res, 200, data);
    } catch (error) {
      sendJson(res, 500, { error: 'Read failed', message: 'Failed to read data.' });
    }
    return;
  }

  if (!pathname.startsWith('/api/data/')) {
    sendJson(res, 404, { error: 'Not found', message: 'API endpoint not found.' });
    return;
  }

  const decoded = requireAuth(req, res);
  if (!decoded) {
    return;
  }

  if (pathname === '/api/data/dashboard' && req.method === 'GET') {
    sendJson(res, 200, buildDashboardPayload());
    return;
  }

  await handleDataRequest(req, res, pathname);
}

function handleStaticRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = url.pathname;

  if (pathname === '/' || pathname === '/index.html') {
    pathname = '/index.html';
  } else if (pathname === '/admin' || pathname === '/admin/') {
    pathname = '/admin/index.html';
  }

  if (pathname.startsWith('/admin/') && !pathname.includes('.')) {
    pathname = `${pathname}.html`;
  }

  const relativePath = pathname.replace(/^\/+/, '');
  let filePath;
  if (pathname.startsWith('/admin/')) {
    filePath = path.join(__dirname, '..', relativePath);
  } else {
    filePath = path.join(__dirname, '..', 'dist', relativePath);
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    sendText(res, 404, 'File not found');
    return;
  }

  const mimeTypes = {
    '.css': 'text/css; charset=utf-8',
    '.gif': 'image/gif',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.jpg': 'image/jpeg',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
  };

  res.setHeader('Content-Type', mimeTypes[path.extname(filePath)] || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname.startsWith('/api/')) {
    handleApiRequest(req, res).catch((error) => {
      sendJson(res, 500, { error: 'Internal error', message: error.message || 'Unexpected server error.' });
    });
    return;
  }

  handleStaticRequest(req, res);
});

server.listen(PORT, HOST, () => {
  const displayHost = HOST === '0.0.0.0' ? '127.0.0.1' : HOST;
  console.log(`Admin server running: http://${displayHost}:${PORT}/admin`);
});

module.exports = {
  server,
};
