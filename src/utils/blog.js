import { marked } from 'marked';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import css from 'highlight.js/lib/languages/css';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import markdown from 'highlight.js/lib/languages/markdown';
import python from 'highlight.js/lib/languages/python';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';
import { COLUMN_IMAGE_MAP, DEFAULT_ABOUT, DEFAULT_COLUMN_IMAGES, DEFAULT_PROFILE } from '../constants/blog';

const COPY_ICON_SVG = [
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
  '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>',
  '<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>',
  '</svg>',
].join('');

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('css', css);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('md', markdown);
hljs.registerLanguage('python', python);
hljs.registerLanguage('py', python);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('xml', xml);

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export function extractId(value) {
  if (value == null) return '';
  if (typeof value === 'object') {
    return String(value.id || value.value || value.slug || value.name || '').trim();
  }
  return String(value).trim();
}

export function toIdArray(...values) {
  const items = [];
  const seen = new Set();

  const append = (value) => {
    const id = extractId(value);
    if (!id || seen.has(id)) return;
    seen.add(id);
    items.push(id);
  };

  values.forEach((value) => {
    if (Array.isArray(value)) {
      value.forEach(append);
      return;
    }
    append(value);
  });

  return items;
}

export function normalizePath(value) {
  if (!value) return '';
  let path = String(value).trim();
  if (path.startsWith('#')) path = path.slice(1);
  if (!path.startsWith('/')) path = `/${path}`;
  return path;
}

export function normalizeNavHref(item) {
  if (!item || !item.href) return '';
  let href = String(item.href).trim();
  if (!href.startsWith('#')) {
    href = href.startsWith('/') ? `#${href}` : `#/${href}`;
  }
  return href;
}

export function postPathFromSlug(slug) {
  if (!slug) return '';
  const raw = String(slug).trim();
  const trimmed = raw.split('#')[0].split('?')[0];
  if (!trimmed) return '';
  const clean = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
  const firstSegment = clean.split('/')[0];
  return firstSegment ? `/${firstSegment}` : '';
}

export function isColumnNavItem(item) {
  if (!item) return false;
  const path = normalizePath(item.href).toLowerCase();
  if (!path || path === '/' || path === '#/' || path === '#') return false;
  if (path.includes('/about')) return false;
  return true;
}

export function columnImage(item, index) {
  const cover = String(item?.cover || '').trim();
  if (cover) return cover;
  const label = String(item?.label || '').trim();
  if (label && COLUMN_IMAGE_MAP[label]) return COLUMN_IMAGE_MAP[label];
  return DEFAULT_COLUMN_IMAGES[index % DEFAULT_COLUMN_IMAGES.length];
}

export function findBySlugOrName(list, slugOrName) {
  const key = String(slugOrName || '').trim();
  if (!key) return null;
  return (
    list.find((item) => item.slug === key) ||
    list.find((item) => item.id === key) ||
    list.find((item) => item.name === key)
  );
}

export function findById(list, id) {
  const key = String(id || '').trim();
  if (!key) return null;
  return list.find((item) => String(item?.id || '').trim() === key) || null;
}

export function slugFromId(list, id) {
  const item = list.find((entry) => entry.id === id);
  return item ? item.slug || item.id : id || '';
}

export function namesFromIds(ids, map) {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  return ids.map((id) => map[id] || id);
}

export function hexToRgba(hex, alpha) {
  const clean = String(hex || '').replace('#', '');
  if (clean.length !== 6) return `rgba(99, 102, 241, ${alpha})`;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function sortPosts(list) {
  return list.slice().sort((a, b) => {
    const ap = a.pinned ? 1 : 0;
    const bp = b.pinned ? 1 : 0;
    if (ap !== bp) return bp - ap;
    const ad = a.created_at || '';
    const bd = b.created_at || '';
    return bd.localeCompare(ad);
  });
}

export function normalizeTaxonomyItem(item = {}) {
  const id = extractId(item.id || item.slug || item.name);
  const name = String(item.name || id).trim();
  if (!id || !name) return null;
  return {
    ...item,
    id,
    name,
    slug: String(item.slug || id).trim(),
    color: String(item.color || '').trim(),
    parent: String(item.parent || '').trim(),
  };
}

export function normalizeSectionItem(item = {}) {
  const id = extractId(item.id || item.slug || item.name);
  const name = String(item.name || item.label || id).trim();
  if (!id || !name) return null;
  const slug = String(item.slug || item.url || id)
    .trim()
    .replace(/^#?\/+/, '')
    .replace(/\/+$/, '');
  const url = normalizePath(item.url || slug || id);
  return {
    ...item,
    id,
    name,
    slug: slug || id,
    url,
    icon: String(item.icon || '').trim(),
    cover: String(item.cover || '').trim(),
    enabled: item.enabled !== false,
    order: Number(item.order || 0) || 0,
  };
}

export function normalizeNavItem(item = {}, index = 0) {
  const label = String(item.label || item.name || '').trim();
  const href = normalizeNavHref({
    ...item,
    href: item.href || item.url,
  });
  if (!label || !href) return null;
  return {
    ...item,
    id: extractId(item.id || `${label}-${index}`),
    label,
    name: String(item.name || label).trim(),
    href,
    url: String(item.url || href.replace(/^#/, '') || '').trim(),
    visible: item.visible !== false && item.enabled !== false,
    enabled: item.enabled !== false && item.visible !== false,
    order: Number(item.order || 0) || 0,
    cover: String(item.cover || '').trim(),
  };
}

export function normalizePost(post = {}) {
  const slug = String(post.slug || '').trim().replace(/^\/+/, '');
  const categories = toIdArray(post.categories, post.categoryIds, post.categoryId);
  const tags = toIdArray(post.tags, post.tagIds, post.tagId);
  const status = String(post.status || (post.published ? 'published' : 'draft')).trim();
  return {
    ...post,
    id: extractId(post.id || slug),
    slug,
    title: String(post.title || '').trim(),
    summary: String(post.summary || '').trim(),
    content: String(post.content || ''),
    cover: String(post.cover || '').trim(),
    categories,
    categoryIds: categories,
    categoryId: categories[0] || '',
    tags,
    tagIds: tags,
    status,
    published: status === 'published',
    created_at: String(post.created_at || formatDate(post.createdAt) || '').trim(),
    updated_at: String(post.updated_at || formatDate(post.updatedAt) || '').trim(),
    readingTime: Number(post.readingTime || 0) || 0,
  };
}

export function primaryCategoryIdFromPost(post = {}) {
  const categories = toIdArray(post.categories, post.categoryIds, post.categoryId);
  return categories[0] || '';
}

export function resolvePrimaryCategory(post = {}, categories = []) {
  const primaryCategoryId = primaryCategoryIdFromPost(post);
  return findById(categories, primaryCategoryId);
}

export function resolveSectionForPost(post = {}, sections = [], categories = []) {
  const sectionId = extractId(post.sectionId);
  const directSection = findById(sections, sectionId);
  if (directSection) return directSection;

  const primaryCategory = resolvePrimaryCategory(post, categories);
  if (primaryCategory?.sectionId) {
    const categorySection = findById(sections, primaryCategory.sectionId);
    if (categorySection) return categorySection;
  }

  const fallbackPath = postPathFromSlug(post.slug).replace(/^\/+/, '');
  if (!fallbackPath) return null;

  return sections.find((section) => {
    const sectionSlug = String(section?.slug || '').trim().replace(/^\/+|\/+$/g, '');
    const sectionPath = normalizePath(section?.url || sectionSlug).replace(/^\/+/, '');
    return sectionSlug === fallbackPath || sectionPath === fallbackPath;
  }) || null;
}

export function resolvePostSectionPath(post = {}, sections = [], categories = []) {
  const section = resolveSectionForPost(post, sections, categories);
  if (section) {
    return normalizePath(section.url || section.slug || section.id);
  }
  return postPathFromSlug(post.slug);
}

export function buildPostHash(post = {}, sections = [], categories = []) {
  const postId = extractId(post.id);
  if (!postId) return '#/';

  const sectionPath = resolvePostSectionPath(post, sections, categories);
  const primaryCategory = resolvePrimaryCategory(post, categories);
  const pathSegments = [];

  const normalizedSectionPath = normalizePath(sectionPath).replace(/^\/+|\/+$/g, '');
  if (normalizedSectionPath) {
    pathSegments.push(...normalizedSectionPath.split('/').filter(Boolean));
  }

  const categorySlug = String(primaryCategory?.slug || primaryCategory?.id || '')
    .trim()
    .replace(/^\/+|\/+$/g, '');
  if (categorySlug) {
    pathSegments.push(categorySlug);
  }

  const baseHash = pathSegments.length
    ? `#/${pathSegments.map((segment) => encodeURIComponent(segment)).join('/')}`
    : '#/post';

  return `${baseHash}?id=${encodeURIComponent(postId)}`;
}

export function cloneDefaultAbout() {
  return {
    ...DEFAULT_ABOUT,
    skills: DEFAULT_ABOUT.skills.map((skill) => ({ ...skill })),
  };
}

export function normalizeSettingsData(settings = {}) {
  const profile = {
    ...DEFAULT_PROFILE,
    ...(settings.profile || {}),
  };
  const about = cloneDefaultAbout();
  Object.assign(about, settings.about || {});

  if (!profile.name && settings.author) {
    profile.name = String(settings.author).trim();
  }
  if (!profile.email && settings.email) {
    profile.email = String(settings.email).trim();
  }
  if (!about.content && settings.description) {
    about.content = String(settings.description).trim();
  }
  if (!about.title && settings.siteName) {
    about.title = String(settings.siteName).trim();
  }
  if (Array.isArray(settings.about?.skills) && settings.about.skills.length > 0) {
    about.skills = settings.about.skills.map((skill) => ({ ...skill }));
  }

  return {
    markdownTheme: String(settings.markdownTheme || 'default').trim() || 'default',
    profile,
    about,
  };
}

export function slugifyHeading(text, idMap) {
  const plain = String(text || '').replace(/<[^>]+>/g, '');
  const base = plain
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fff-]/g, '');
  const safe = base || 'section';
  const count = idMap.get(safe) || 0;
  idMap.set(safe, count + 1);
  return count === 0 ? safe : `${safe}-${count + 1}`;
}

export function inlineMarkdownToText(text) {
  const html = marked.parseInline(text || '');
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function encodeBase64(text) {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch {
    return btoa(text);
  }
}

export function decodeBase64(text) {
  try {
    return decodeURIComponent(escape(atob(text)));
  } catch {
    return atob(text);
  }
}

export function createRenderer() {
  const idMap = new Map();
  const renderer = new marked.Renderer();

  renderer.code = (code, infostring) => {
    let text = code;
    let lang = infostring || '';
    if (code && typeof code === 'object') {
      text = code.text || '';
      lang = code.lang || lang;
    }
    const language = String(lang || '').trim().split(/\s+/)[0];
    let highlighted = '';
    try {
      if (language && hljs.getLanguage(language)) {
        highlighted = hljs.highlight(text, { language }).value;
      } else {
        highlighted = hljs.highlightAuto(text).value;
      }
    } catch {
      highlighted = String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
    const langClass = language ? ` language-${language}` : '';
    const langLabel = language || 'text';
    const encoded = encodeBase64(String(text || ''));
    return `
      <div class="code-block">
        <div class="code-block-header">
          <span class="code-dots"><i></i><i></i><i></i></span>
          <div class="code-actions">
            <span class="code-lang">${langLabel}</span>
            <button class="code-copy" type="button" data-code="${encoded}">
              <span class="code-copy-icon">${COPY_ICON_SVG}</span>
              <span class="code-copy-text">复制代码</span>
            </button>
          </div>
        </div>
        <pre><code class="hljs${langClass}">${highlighted}</code></pre>
      </div>
    `;
  };

  renderer.heading = (text, level) => {
    if (text && typeof text === 'object') {
      const token = text;
      const tokenText = token.text || '';
      const tokenLevel = token.depth || 1;
      const id = slugifyHeading(tokenText, idMap);
      return `<h${tokenLevel} id="${id}">${marked.parseInline(tokenText)}</h${tokenLevel}>`;
    }
    const id = slugifyHeading(text, idMap);
    return `<h${level} id="${id}">${marked.parseInline(text || '')}</h${level}>`;
  };

  return renderer;
}

export function renderMarkdown(markdown) {
  return marked.parse(markdown || '', {
    renderer: createRenderer(),
    mangle: true,
    headerIds: false,
  });
}

export function countWordsFromMarkdown(markdown) {
  if (!markdown) return 0;
  let text = String(markdown);
  text = text.replace(/```[\s\S]*?```/g, ' ');
  text = text.replace(/`[^`]*`/g, ' ');
  text = text.replace(/!\[[^\]]*]\([^)]+\)/g, ' ');
  text = text.replace(/\[[^\]]*]\([^)]+\)/g, ' ');
  text = text.replace(/<[^>]+>/g, ' ');
  text = text.replace(/[#>*_~\\-]+/g, ' ');
  text = text.replace(/\s+/g, ' ').trim();

  const cjk = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const latinWords = (text.replace(/[\u4e00-\u9fff]/g, ' ').match(/[A-Za-z0-9]+/g) || []).length;
  return cjk + latinWords;
}

export function estimateReadingTimeMinutes(content) {
  const wordCount = countWordsFromMarkdown(content);
  if (!wordCount) return 0;
  return Math.max(1, Math.ceil(wordCount / 200));
}

export function matchesSearch(post, query, categoryMap = {}, tagMap = {}) {
  if (!query) return true;
  const q = String(query || '').toLowerCase();
  const categoriesText = (post.categories || []).map((id) => categoryMap[id] || id).join(' ');
  const tagsText = (post.tags || []).map((id) => tagMap[id] || id).join(' ');
  const base = `${post.title || ''} ${post.summary || ''} ${categoriesText} ${tagsText}`.toLowerCase();
  return base.includes(q);
}

export function buildToc(markdown) {
  if (!markdown) return [];
  const tokens = marked.lexer(markdown);
  const idMap = new Map();
  return tokens
    .filter((token) => token.type === 'heading')
    .map((token) => {
      const text = token.text || '';
      return {
        id: slugifyHeading(text, idMap),
        text: inlineMarkdownToText(text),
        level: token.depth || 1,
      };
    })
    .filter((item) => item.level >= 1 && item.level <= 4);
}


