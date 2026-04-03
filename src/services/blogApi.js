
import {
  estimateReadingTimeMinutes,
  normalizeNavItem,
  normalizePost,
  normalizeSectionItem,
  normalizeSettingsData,
  normalizeTaxonomyItem,
  sortPosts,
} from '../utils/blog';
import { API_BASE } from '../constants/blog';

export async function fetchBlogData() {
  const postsUrl = `${API_BASE}/posts`;
  const categoriesUrl = `${API_BASE}/categories`;
  const tagsUrl = `${API_BASE}/tags`;
  const sectionsUrl = `${API_BASE}/sections`;
  const settingsUrl = `${API_BASE}/settings`;
  const navUrl = `${API_BASE}/nav`;
  const graphicsUrl = `${API_BASE}/graphics`;

  const [postsRes, categoriesRes, tagsRes, sectionsRes, settingsRes, navRes, graphicsRes] = await Promise.all([
    fetch(postsUrl),
    fetch(categoriesUrl),
    fetch(tagsUrl),
    fetch(sectionsUrl),
    fetch(settingsUrl),
    fetch(navUrl).catch(() => null),
    fetch(graphicsUrl).catch(() => null),
  ]);

  if (!postsRes.ok || !categoriesRes.ok || !tagsRes.ok || !sectionsRes.ok) {
    throw new Error('Failed to load data from server.');
  }

  const postsData = await postsRes.json();
  const categoriesData = await categoriesRes.json();
  const tagsData = await tagsRes.json();
  const sectionsData = await sectionsRes.json();
  const settingsData = settingsRes.ok ? await settingsRes.json() : {};
  const navData = navRes && navRes.ok ? await navRes.json() : null;

  const posts = sortPosts(
    (Array.isArray(postsData) ? postsData : [])
      .map((post) => normalizePost(post))
      .filter((post) => post.status === 'published')
      .map((post) => ({
        ...post,
        readingTime: post.readingTime || estimateReadingTimeMinutes(post.content),
      })),
  );

  const categories = (Array.isArray(categoriesData) ? categoriesData : [])
    .map((item) => normalizeTaxonomyItem(item))
    .filter(Boolean);

  const tags = (Array.isArray(tagsData) ? tagsData : [])
    .map((item) => normalizeTaxonomyItem(item))
    .filter(Boolean);

  const sections = (Array.isArray(sectionsData) ? sectionsData : [])
    .map((item) => normalizeSectionItem(item))
    .filter(Boolean);

  const navItems = (Array.isArray(navData) ? navData : [])
    .map((item, index) => normalizeNavItem(item, index))
    .filter(Boolean);

  const graphicsData = graphicsRes && graphicsRes.ok ? await graphicsRes.json() : [];
  console.log('graphics API响应:', {
    status: graphicsRes?.status,
    ok: graphicsRes?.ok,
    dataLength: graphicsData?.length,
    sampleData: graphicsData?.[0]
  });
  const graphics = (Array.isArray(graphicsData) ? graphicsData : [])
    .filter((item) => item.status === 'published');
  console.log('过滤后的graphics数据:', graphics.length);

  return {
    posts,
    categories,
    tags,
    sections,
    navItems,
    graphics,
    settings: normalizeSettingsData(settingsData || {}),
  };
}

export async function fetchIssues() {
  const url = `${API_BASE}/issues`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to load issues data.');
  }
  
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchTools() {
  const url = `${API_BASE}/tools`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to load tools data.');
  }

  return await response.json();
}

export async function fetchGraphics() {
  const url = `${API_BASE}/graphics`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Failed to load graphics data.');
  }

  const data = await response.json();
  return Array.isArray(data) ? data : [];
}
